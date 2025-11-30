import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useQueryClient } from 'react-query';
import config from '../config/config';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();
  
  const { user, token } = useSelector((state) => state.auth);

  // Helper function to invalidate cache by key pattern
  const invalidateQueries = useCallback((queryKey) => {
    queryClient.invalidateQueries(queryKey);
  }, [queryClient]);

  useEffect(() => {
    let newSocket;

    if (user && token) {
      // Determine socket URL (remove /api if present in config.apiUrl)
      const socketUrl = config.apiUrl.replace('/api', '');
      
      // Initialize socket connection
      newSocket = io(socketUrl, {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        // Join user specific room
        newSocket.emit('user:join', user._id);
        
        // If user is NGO admin, join NGO room
        // Note: We need to ensure user object has ngoId or we fetch it
        if (user.role === 'ngo_admin' && user.ngo) {
           newSocket.emit('ngo:join', user.ngo);
        }
      });

      newSocket.on('notification', (notification) => {
        console.log('New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        
        // Show toast
        toast(notification.message, {
            icon: '🔔',
            duration: 4000,
            position: 'top-right'
        });
      });

      // Listen for activity events for real-time updates
      newSocket.on('activity:new', (activity) => {
        console.log('New activity:', activity);
        toast('New activity recorded!', {
          icon: '✨',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      // EVENT SOCKET LISTENERS - Invalidate events cache
      newSocket.on('event:created', (event) => {
        console.log('Event created:', event);
        invalidateQueries(['events']);
        toast('New event created!', {
          icon: '📅',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      newSocket.on('event:updated', (event) => {
        console.log('Event updated:', event);
        invalidateQueries(['events']);
        invalidateQueries(['event', event._id]);
      });

      newSocket.on('event:deleted', (eventId) => {
        console.log('Event deleted:', eventId);
        invalidateQueries(['events']);
        invalidateQueries(['event', eventId]);
      });

      newSocket.on('donation:created', (donation) => {
        console.log('Donation created:', donation);
        invalidateQueries(['donations']);
        toast('New donation listed!', {
          icon: '🎁',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      // DONATION SOCKET LISTENERS - Invalidate donations cache
      newSocket.on('donation:updated', (donation) => {
        console.log('Donation updated:', donation);
        invalidateQueries(['donations']);
        invalidateQueries(['donation', donation._id]);
        invalidateQueries(['my-donations']);
      });

      newSocket.on('donation:accepted', (donation) => {
        console.log('Donation accepted:', donation);
        invalidateQueries(['donations']);
        invalidateQueries(['my-donations']);
        toast('A donation was accepted!', {
          icon: '✅',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      newSocket.on('donation:cancelled', (donationId) => {
        console.log('Donation cancelled:', donationId);
        invalidateQueries(['donations']);
        invalidateQueries(['my-donations']);
      });

      newSocket.on('event:joined', (eventData) => {
        console.log('Event joined:', eventData);
        invalidateQueries(['events']);
        invalidateQueries(['event', eventData.eventId]);
      });

      newSocket.on('event:attended', (eventData) => {
        console.log('Event attended:', eventData);
        invalidateQueries(['events']);
        invalidateQueries(['event', eventData.eventId]);
      });

      // HELP REQUEST SOCKET LISTENERS - Invalidate help requests cache
      newSocket.on('help-request:created', (helpRequest) => {
        console.log('Help request created:', helpRequest);
        invalidateQueries(['help-requests']);
        toast('New help request posted!', {
          icon: '🆘',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      newSocket.on('help-request:updated', (helpRequest) => {
        console.log('Help request updated:', helpRequest);
        invalidateQueries(['help-requests']);
        invalidateQueries(['help-request', helpRequest._id]);
      });

      newSocket.on('help-request:deleted', (helpRequestId) => {
        console.log('Help request deleted:', helpRequestId);
        invalidateQueries(['help-requests']);
        invalidateQueries(['help-request', helpRequestId]);
      });

      newSocket.on('certificate:earned', (certificate) => {
        console.log('Certificate earned:', certificate);
        invalidateQueries(['certificates']);
        invalidateQueries(['my-certificates']);
        toast('New certificate earned! 🏆', {
          icon: '✨',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      // POINTS & GAMIFICATION SOCKET LISTENERS
      newSocket.on('points:earned', (data) => {
        console.log('Points earned:', data);
        invalidateQueries(['progress']);
        invalidateQueries(['leaderboard']);
        
        if (data.levelUp) {
          toast(`Level Up! 🎉 You reached ${data.newLevel}!`, {
            icon: '⭐',
            duration: 4000,
            position: 'top-right'
          });
        }
      });

      newSocket.on('badge:earned', (badge) => {
        console.log('Badge earned:', badge);
        invalidateQueries(['progress']);
        invalidateQueries(['badges']);
        toast(`New badge: ${badge.name}! 🏅`, {
          icon: '⭐',
          duration: 3000,
          position: 'bottom-right'
        });
      });

      newSocket.on('leaderboard:updated', () => {
        console.log('Leaderboard updated');
        invalidateQueries(['leaderboard']);
      });

      newSocket.on('payment:completed', (payment) => {
        console.log('Payment completed:', payment);
        invalidateQueries(['donations']);
        invalidateQueries(['my-donations']);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.off('notification');
        newSocket.off('activity:new');
        newSocket.off('event:created');
        newSocket.off('event:updated');
        newSocket.off('event:deleted');
        newSocket.off('event:joined');
        newSocket.off('event:attended');
        newSocket.off('donation:created');
        newSocket.off('donation:updated');
        newSocket.off('donation:accepted');
        newSocket.off('donation:cancelled');
        newSocket.off('help-request:created');
        newSocket.off('help-request:updated');
        newSocket.off('help-request:deleted');
        newSocket.off('certificate:earned');
        newSocket.off('badge:earned');
        newSocket.off('points:earned');
        newSocket.off('leaderboard:updated');
        newSocket.off('payment:completed');
        newSocket.disconnect();
      }
    };
  }, [user, token, invalidateQueries]);

  // Function to mark notification as read
  const markAsRead = (id) => {
      setNotifications(prev => prev.map(n => 
          n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Function to mark all as read
  const markAllAsRead = () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
  };

  // Function to set initial notifications (e.g. from API fetch)
  const setInitialNotifications = (data) => {
      setNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
  };

  return (
    <SocketContext.Provider value={{ 
        socket, 
        notifications, 
        unreadCount, 
        setNotifications, 
        setUnreadCount, 
        markAsRead,
        markAllAsRead,
        setInitialNotifications,
        invalidateQueries
    }}>
      {children}
    </SocketContext.Provider>
  );
};

