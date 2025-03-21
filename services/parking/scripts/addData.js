const mongoose = require('mongoose');
const { Garage, Slot } = require('../database/db');

const mongoURI = '';

const delhiGarages = [
    {
        name: "Connaught Place Parking Hub",
        location: {
            latitude: 28.6329,
            longitude: 77.2195
        },
        totalSlots: 20,
        availableSlots: 8,
        slotTypes: ['compact', 'SUV', 'EV', 'handicap'],
        pricePerHour: 80
    },
    {
        name: "Karol Bagh Multi-Level Parking",
        location: {
            latitude: 28.6514,
            longitude: 77.1907
        },
        totalSlots: 20,
        availableSlots: 12,
        slotTypes: ['compact', 'SUV', 'bike', 'handicap'],
        pricePerHour: 60
    },
    {
        name: "Lajpat Nagar Central Garage",
        location: {
            latitude: 28.5693,
            longitude: 77.2432
        },
        totalSlots: 20,
        availableSlots: 5,
        slotTypes: ['compact', 'SUV', 'EV'],
        pricePerHour: 70
    },
    {
        name: "Saket PVR Plaza Parking",
        location: {
            latitude: 28.5244,
            longitude: 77.2167
        },
        totalSlots: 20,
        availableSlots: 15,
        slotTypes: ['compact', 'SUV', 'handicap', 'bike'],
        pricePerHour: 100
    },
    {
        name: "Vasant Kunj Community Garage",
        location: {
            latitude: 28.5254,
            longitude: 77.1554
        },
        totalSlots: 20,
        availableSlots: 7,
        slotTypes: ['compact', 'SUV', 'bike'],
        pricePerHour: 65
    },
    {
        name: "Dwarka Sector-12 Parking",
        location: {
            latitude: 28.5914,
            longitude: 77.0298
        },
        totalSlots: 20,
        availableSlots: 14,
        slotTypes: ['compact', 'SUV', 'EV', 'handicap', 'bike'],
        pricePerHour: 50
    },
    {
        name: "Rohini Metro Parking Complex",
        location: {
            latitude: 28.7141,
            longitude: 77.1025
        },
        totalSlots: 20,
        availableSlots: 6,
        slotTypes: ['compact', 'SUV', 'bike'],
        pricePerHour: 55
    },
    {
        name: "Chandni Chowk Heritage Parking",
        location: {
            latitude: 28.6506,
            longitude: 77.2295
        },
        totalSlots: 20,
        availableSlots: 3,
        slotTypes: ['compact', 'bike'],
        pricePerHour: 90
    },
    {
        name: "Rajouri Garden Premium Parking",
        location: {
            latitude: 28.6492,
            longitude: 77.1126
        },
        totalSlots: 20,
        availableSlots: 10,
        slotTypes: ['compact', 'SUV', 'EV', 'handicap'],
        pricePerHour: 75
    },
    {
        name: "Nehru Place Tech Hub Garage",
        location: {
            latitude: 28.5491,
            longitude: 77.2503
        },
        totalSlots: 20,
        availableSlots: 9,
        slotTypes: ['compact', 'SUV', 'EV', 'bike'],
        pricePerHour: 85
    }
];

async function insertGarages() {
    try {
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');

      await Garage.insertMany(delhiGarages);
      console.log('Data inserted successfully');

      mongoose.connection.close();
    } catch (err) {
      console.error('Error inserting data:', err);
    }
  }

  insertGarages();

async function insertSlots() {
    try {
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        const garages = await Garage.find();
        const slotsToInsert = [];

        for (const garage of garages) {
            for (let i = 1; i <= garage.totalSlots; i++) {
                slotsToInsert.push({
                    garageId: garage._id,
                    slotNumber: i,
                    status: "available"
                });
            }
        }

        await Slot.insertMany(slotsToInsert);
        console.log("Slots inserted successfully");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

insertSlots();

async function updateAvailableSlots() {
    await mongoose.connect(mongoURI);

    const garages = await Garage.find();

    for (const garage of garages) {
        await Garage.updateOne(
            { _id: garage._id },
            { $set: { availableSlots: garage.totalSlots } }
        );
    }

    console.log("Updated all garages.");
    mongoose.connection.close();
}

updateAvailableSlots();