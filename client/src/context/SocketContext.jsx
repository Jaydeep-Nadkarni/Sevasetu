import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import config from '../config/config';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { user, token } = useSelector((state) => state.auth);

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

      // Listen for specific events if needed
      newSocket.on('donation:accepted', (data) => {
          // These might be redundant if we use the generic 'notification' event
          // but useful for specific UI updates (like refreshing a list)
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user, token]);

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
        setInitialNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};
