import NGO from '../models/NGO.js'

// === LIST NGOS ===
export const listNGOs = async (req, res) => {
  try {
    const {
      category,
      city,
      search,
      lat,
      lng,
      radius,
      page = 1,
      limit = 10,
    } = req.query

    const filter = { status: 'approved' } // Only show approved NGOs

    if (category && category !== 'all') {
      filter.focusAreas = category
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i')
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ]
    }

    // Geospatial filter
    if (lat && lng && radius) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    }

    const skip = (page - 1) * limit
    const total = await NGO.countDocuments(filter)

    const ngos = await NGO.find(filter)
      .select('name description logo location focusAreas contact rating')
      .limit(parseInt(limit))
      .skip(skip)

    res.json({
      ngos,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: ngos.length,
        totalNGOs: total,
      },
    })
  } catch (error) {
    console.error('Error listing NGOs:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET NGO BY ID ===
export const getNGOById = async (req, res) => {
  try {
    const { id } = req.params
    const ngo = await NGO.findById(id).populate('admin', 'name email')

    if (!ngo) {
      return res.status(404).json({ message: 'NGO not found' })
    }

    res.json({ ngo })
  } catch (error) {
    console.error('Error fetching NGO:', error)
    res.status(500).json({ message: error.message })
  }
}
