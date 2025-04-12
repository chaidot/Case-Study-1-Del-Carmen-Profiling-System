const express = require('express');
const redis = require('redis');
const bcrypt = require("bcrypt");
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

// Redis event handlers
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('reconnecting', () => {
  console.log('Redis Client Reconnecting...');
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// LOGIN

// Function to authenticate user
async function authenticateUser(email, password) {
  const storedPassword = await client.hGet(`user:${email}`, "password");
  if (!storedPassword) return false; // User not found

  return bcrypt.compare(password, storedPassword); // Compare hashed password
}

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
  }

  const isValid = await authenticateUser(email, password);
  if (isValid) {
      res.json({ success: true, message: "Login successful" });
  } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// CRUD Operations

// Route to save resident data
app.post('/residents', async (req, res) => {
  const { firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion, houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school, employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember} = req.body;

  try {
    // Get the highest current ID (or start from 1)
    const newId = await client.incr("residentid");

    // Residents data
    const residentData = {firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion, houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school, employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember };

    // Save resident data in Redis hash
    await client.hSet(`resident:${newId}`, 'firstname', residentData.firstname);
    await client.hSet(`resident:${newId}`, 'middlename', residentData.middlename);
    await client.hSet(`resident:${newId}`, 'lastname', residentData.lastname);
    await client.hSet(`resident:${newId}`, 'suffix', residentData.suffix);
    await client.hSet(`resident:${newId}`, 'sex', residentData.sex);
    await client.hSet(`resident:${newId}`, 'birthdate', residentData.birthdate);
    await client.hSet(`resident:${newId}`, 'maritalStatus', residentData.maritalStatus);
    await client.hSet(`resident:${newId}`, 'nationality', residentData.nationality);
    await client.hSet(`resident:${newId}`, 'religion', residentData.religion);
    await client.hSet(`resident:${newId}`, 'houseNumber', residentData.houseNumber);
    await client.hSet(`resident:${newId}`, 'purok', residentData.purok);
    await client.hSet(`resident:${newId}`, 'barangay', residentData.barangay);
    await client.hSet(`resident:${newId}`, 'mobileNumber', residentData.mobileNumber);
    await client.hSet(`resident:${newId}`, 'email', residentData.email);
    await client.hSet(`resident:${newId}`, 'isStudent', residentData.isStudent);
    await client.hSet(`resident:${newId}`, 'schoolLevel', residentData.schoolLevel);
    await client.hSet(`resident:${newId}`, 'grade', residentData.grade);
    await client.hSet(`resident:${newId}`, 'school', residentData.school);
    await client.hSet(`resident:${newId}`, 'employmentStatus', residentData.employmentStatus);
    await client.hSet(`resident:${newId}`, 'occupation', residentData.occupation);
    await client.hSet(`resident:${newId}`, 'dateStarted', residentData.dateStarted);
    await client.hSet(`resident:${newId}`, 'monthlyIncome', residentData.monthlyIncome);
    await client.hSet(`resident:${newId}`, 'is4Ps', residentData.is4Ps);
    await client.hSet(`resident:${newId}`, 'isSeniorCitizen', residentData.isSeniorCitizen);
    await client.hSet(`resident:${newId}`, 'isPhilhealthMember', residentData.isPhilhealthMember);

    res.status(201).json({ message: 'Resident saved successfully', id: newId });
  } catch (error) {
    console.error('Error saving Resident:', error);
    res.status(500).json({ message: 'Failed to save Resident', error: error.message });
  }
});

      app.post("/upload-csv", async (req, res) => {
        const { residents } = req.body;

        console.log("Residents Receieved:", residents);
      
        if (!Array.isArray(residents) || residents.length === 0) {
          return res.status(400).json({ message: "Invalid CSV data" });
        }
      
        try {
          const skipped_residents = [];
      
          for (const resident of residents) {
            const newId = await client.incr("residentid");
      
            // Ensure all fields have a valid value or default to an empty string
            const cleanResident = Object.fromEntries(
              Object.entries(resident).map(([key, value]) => [key, String(value ?? "")])
            );

      console.log("Clean Residen:", cleanResident);
      
      // ✅ Corrected hSet usage
            for (const [key, value] of Object.entries(cleanResident)) {
              await client.hSet(`resident:${newId}`, key, value);
            }            
      
            console.log(`Saved new resident: resident:${newId}`);
          }
      
          if (skipped_residents.length > 0) {
            return res.status(409).json({ message: skipped_residents });
          }
      
          res.status(201).json({ message: "CSV data uploaded successfully" });
        } catch (error) {
          console.error("Error saving CSV data:", error);
          res.status(500).json({ message: "Failed to process CSV data" });
        }
      });

// Read all residents
app.get('/residents', async (req, res) => {
  try {
    const keys = await client.keys('resident:*');
    
    // Retrieve all residents
    const residents = await Promise.all(keys.map(async (key) => {
      const resident = await client.hGetAll(key);
      resident.id = key.split(':')[1]; // Extract ID from key
      return resident;
    }));

    res.json(residents);
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({ message: 'Failed to fetch residents' });
  }
});

// Get single resident by ID
app.get('/residents/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const resident = await client.hGetAll(`resident:${id}`);
    
    if (Object.keys(resident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }
    
    resident.id = id;
    res.json(resident);
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({ message: 'Failed to fetch resident' });
  }
});

// Update (U)
app.put('/residents/:id', async (req, res) => {
  const id = req.params.id;
  const { firstname, middlename, lastname, suffix, sex, birthdate, maritalStatus, nationality, religion, houseNumber, purok, barangay, mobileNumber, email, isStudent, schoolLevel, grade, school, employmentStatus, occupation, dateStarted, monthlyIncome, is4Ps, isSeniorCitizen, isPhilhealthMember} = req.body;

  try {
    const existingResident = await client.hGetAll(`resident:${id}`);
    if (Object.keys(existingResident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Update resident data in Redis
    if (firstname) await client.hSet(`resident:${id}`, 'firstname', firstname);
    if (middlename) await client.hSet(`resident:${id}`, 'middlename', middlename);
    if (lastname) await client.hSet(`resident:${id}`, 'lastname', lastname);
    if (suffix) await client.hSet(`resident:${id}`, 'suffix', suffix);
    if (sex) await client.hSet(`resident:${id}`, 'sex', sex);
    if (birthdate) await client.hSet(`resident:${id}`, 'birthdate', birthdate);
    if (maritalStatus) await client.hSet(`resident:${id}`, 'maritalStatus', maritalStatus);
    if (nationality) await client.hSet(`resident:${id}`, 'nationality', nationality);
    if (religion) await client.hSet(`resident:${id}`, 'religion', religion);
    if (houseNumber) await client.hSet(`resident:${id}`, 'houseNumber', houseNumber);
    if (purok) await client.hSet(`resident:${id}`, 'purok', purok);
    if (barangay) await client.hSet(`resident:${id}`, 'barangay', barangay);
    if (mobileNumber) await client.hSet(`resident:${id}`, 'mobileNumber', mobileNumber);
    if (email) await client.hSet(`resident:${id}`, 'email', email);
    if (isStudent) await client.hSet(`resident:${id}`, 'isStudent', isStudent);
    await client.hSet(`resident:${id}`, 'schoolLevel', schoolLevel);
    await client.hSet(`resident:${id}`, 'grade', grade);
    await client.hSet(`resident:${id}`, 'school', school);
    if (employmentStatus) await client.hSet(`resident:${id}`, 'employmentStatus', employmentStatus);
    await client.hSet(`resident:${id}`, 'occupation', occupation);
    await client.hSet(`resident:${id}`, 'dateStarted', dateStarted);
    await client.hSet(`resident:${id}`, 'monthlyIncome', monthlyIncome);
    if (is4Ps) await client.hSet(`resident:${id}`, 'is4Ps', is4Ps);
    if (isSeniorCitizen) await client.hSet(`resident:${id}`, 'isSeniorCitizen', isSeniorCitizen);
    if (isPhilhealthMember) await client.hSet(`resident:${id}`, 'isPhilhealthMember', isPhilhealthMember);

    res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});

// Delete (D)
app.delete('/residents/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`resident:${id}`);
  res.status(200).json({ message: 'Resident deleted successfully' });
});

// HOUSEHOLD

//Fetching all the household data
app.get("/api/household", async (req, res) => {
  try {
    const keys = await client.keys("household:*"); // Get all household keys

    if (keys.length === 0) {
      return res.status(200).json([]); // Return empty array if no data
    }

    const householdData = await Promise.all(
      keys.map(async (key) => {
        const members = await client.get(key);
        return {
          id: key.split(":")[1], // Extract numeric part of the household ID
          members: JSON.parse(members) // Store members inside "members" array
        };
      })
    );

    res.status(200).json(householdData);
  } catch (error) {
    console.error("Error fetching household data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API route to save householdData
app.post("/api/household", async (req, res) => {
  const { householdData } = req.body;

  if (!householdData || !Array.isArray(householdData) || householdData.length === 0) {
    return res.status(400).json({ message: "Invalid household data" });
  }

  try {
    // Generate a unique household ID using INCR
    const householdId = await client.incr("householdid");

    // Store the household data under household:<householdId>
    const key = `household:${householdId}`;
    await client.set(key, JSON.stringify(householdData));

    res.status(200).json({ message: "Household data saved successfully!", householdId });
  } catch (error) {
    console.error("Error saving to Redis:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Edit Household
app.put("/api/household/:id", async (req, res) => {
  const { id } = req.params;
  const { members } = req.body;

  if (!members || !Array.isArray(members)) {
      return res.status(400).json({ message: "Invalid household data" });
  }

  try {
      const key = `household:${id}`;
      const exists = await client.exists(key);

      if (!exists) {
          return res.status(404).json({ message: "Household not found" });
      }

      // Fetch existing household data
      const existingHousehold = await client.get(key);
      let householdData = existingHousehold ? JSON.parse(existingHousehold) : {};

      // Update members in the existing household object
      householdData = members;

      // Save updated household data back to Redis
      await client.set(key, JSON.stringify(householdData));

      res.status(200).json({ message: "Household updated successfully!" });
  } catch (error) {
      console.error("Error updating household:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

//Delete Household
app.delete("/api/household/:id", async (req, res) => {
  const { id } = req.params;

  try {
      const key = `household:${id}`;
      const exists = await client.exists(key);

      if (!exists) {
          return res.status(404).json({ message: "Household not found" });
      }

      // Delete the household from Redis
      await client.del(key);

      res.status(200).json({ message: "Household deleted successfully!" });
  } catch (error) {
      console.error("Error deleting household:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
});

// USER MANAGEMENT ROUTES

// Get all users
app.get("/users", async (req, res) => {
    try {
        console.log('Attempting to fetch users from Redis...');
        const keys = await client.keys("user:*");
        console.log('Found keys:', keys);
        
        const users = await Promise.all(
            keys.map(async (key) => {
                console.log('Fetching data for key:', key);
                const userData = await client.hGetAll(key);
                console.log('User data:', userData);
                return {
                    email: userData.email,
                    role: userData.role
                };
            })
        );
        console.log('Final users array:', users);
        res.json(users);
    } catch (error) {
        console.error('Detailed error in /users route:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch users",
            error: error.message 
        });
    }
});

// Register new user
app.post("/register", async (req, res) => {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        // Check if user already exists
        const exists = await client.exists(`user:${email}`);
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store user data
        await client.hSet(`user:${email}`, {
            email: email,
            password: hashedPassword,
            role: role || 'user',
            createdAt: new Date().toISOString()
        });

        res.status(201).json({ success: true, message: "User created successfully" });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, message: "Failed to create user" });
    }
});

// Delete user
app.delete("/users/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const userKey = `user:${email}`;
        
        // Check if user exists
        const exists = await client.exists(userKey);
        if (!exists) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete the user
        await client.del(userKey);
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
});

// INCIDENT REPORTING ROUTES

// Get all incidents
app.get('/incidents', async (req, res) => {
  try {
    const keys = await client.keys('incident:*');
    const incidents = await Promise.all(keys.map(async (key) => {
      const incident = await client.hGetAll(key);
      incident.id = key.split(':')[1]; // Extract ID from key
      return incident;
    }));
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ message: 'Failed to fetch incidents' });
  }
});

// Create new incident
app.post('/incidents', async (req, res) => {
  const { type, title, description, location, reporterName, reporterContact, priority, status } = req.body;

  try {
    // Get the highest current ID (or start from 1)
    const newId = await client.incr("incidentid");

    // Save incident data in Redis hash
    await client.hSet(`incident:${newId}`, 'type', type);
    await client.hSet(`incident:${newId}`, 'title', title);
    await client.hSet(`incident:${newId}`, 'description', description);
    await client.hSet(`incident:${newId}`, 'location', location);
    await client.hSet(`incident:${newId}`, 'reporterName', reporterName);
    await client.hSet(`incident:${newId}`, 'reporterContact', reporterContact);
    await client.hSet(`incident:${newId}`, 'priority', priority);
    await client.hSet(`incident:${newId}`, 'status', status);
    await client.hSet(`incident:${newId}`, 'date', new Date().toISOString());

    res.status(201).json({ message: 'Incident reported successfully', id: newId });
  } catch (error) {
    console.error('Error saving incident:', error);
    res.status(500).json({ message: 'Failed to save incident', error: error.message });
  }
});

// Update incident status
app.put('/incidents/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const existingIncident = await client.hGetAll(`incident:${id}`);
    if (Object.keys(existingIncident).length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    await client.hSet(`incident:${id}`, 'status', status);
    res.status(200).json({ message: 'Incident status updated successfully' });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ message: 'Failed to update incident' });
  }
});

// DOCUMENT MANAGEMENT ROUTES

// Get all documents
app.get('/documents', async (req, res) => {
    try {
        const keys = await client.keys('document:*');
        const documents = await Promise.all(keys.map(async (key) => {
            const document = await client.hGetAll(key);
            document.id = key.split(':')[1];
            return document;
        }));
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents' });
    }
});

// Create new document
app.post('/documents', async (req, res) => {
    const { documentType, residentId, purpose, dateIssued, status, amount, validUntil, requirements, notes } = req.body;

    try {
        const newId = await client.incr("documentid");

        await client.hSet(`document:${newId}`, 'documentType', documentType);
        await client.hSet(`document:${newId}`, 'residentId', residentId);
        await client.hSet(`document:${newId}`, 'purpose', purpose);
        await client.hSet(`document:${newId}`, 'dateIssued', dateIssued);
        await client.hSet(`document:${newId}`, 'status', status);
        await client.hSet(`document:${newId}`, 'amount', amount || '0');
        await client.hSet(`document:${newId}`, 'validUntil', validUntil || '');
        await client.hSet(`document:${newId}`, 'requirements', requirements || '');
        await client.hSet(`document:${newId}`, 'notes', notes || '');

        res.status(201).json({ message: 'Document created successfully', id: newId });
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Failed to create document', error: error.message });
    }
});

// Update document status
app.put('/documents/:id', async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    try {
        const existingDocument = await client.hGetAll(`document:${id}`);
        if (Object.keys(existingDocument).length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await client.hSet(`document:${id}`, 'status', status);
        res.status(200).json({ message: 'Document status updated successfully' });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Failed to update document' });
    }
});

// Delete document
app.delete('/documents/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const exists = await client.exists(`document:${id}`);
        if (!exists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        await client.del(`document:${id}`);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document' });
    }
});

// Download document
app.get('/documents/:id/download', async (req, res) => {
    const id = req.params.id;

    try {
        const document = await client.hGetAll(`document:${id}`);
        if (Object.keys(document).length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=document-${id}.pdf`);

        doc.pipe(res);
        
        doc.fontSize(20).text('Barangay Document', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Document Type: ${document.documentType}`);
        doc.text(`Resident ID: ${document.residentId}`);
        doc.text(`Purpose: ${document.purpose}`);
        doc.text(`Date Issued: ${new Date(document.dateIssued).toLocaleDateString()}`);
        doc.text(`Status: ${document.status}`);
        doc.text(`Amount: ₱${document.amount || '0.00'}`);
        doc.text(`Valid Until: ${document.validUntil ? new Date(document.validUntil).toLocaleDateString() : 'N/A'}`);
        doc.text(`Requirements: ${document.requirements || 'None'}`);
        doc.text(`Notes: ${document.notes || 'None'}`);
        doc.moveDown();
        doc.fontSize(10).text('This is an official document of the Barangay.', { align: 'center' });
        
        doc.end();
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Failed to download document' });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
