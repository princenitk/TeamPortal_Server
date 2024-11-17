require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
const database = path.join(__dirname, 'db.json');

// Get all employees
app.get('/api/employees', (req, res) =>{
    fs.readFile(database, (err, data)=>{
        if(err){
            return res.status(500).json({message : 'Error reading data'});
        }
        return res.json(JSON.parse(data));
    })
})


// Add a new employee (POST)
app.post('/api/employees', (req, res) => {
    const newEmployee = req.body;

    if (!newEmployee) {
        return res.status(400).json({ message: 'Employee data is required.' });
    }

    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ message: 'Error reading data' });
        }

        let employees = [];
        try {
            employees = JSON.parse(data).employees;
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            return res.status(500).json({ message: 'Error parsing data' });
        }

        // Assuming newEmployee contains a field 'id' to generate new employee ID
        const newId = employees.length ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
        const employeeWithId = { id: newId, ...newEmployee };

        employees.push(employeeWithId);

        const updatedData = { employees };

        fs.writeFile(database, JSON.stringify(updatedData, null, 2), (writeError) => {
            if (writeError) {
                console.error('Error writing to db.json:', writeError);
                return res.status(500).json({ message: 'Error saving employee' });
            }

            return res.status(201).json({ message: 'Employee added successfully', employee: employeeWithId });
        });
    });
});
// Put request to update employee


app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const updatedEmployee = req.body;

    if (!id || !updatedEmployee) {
        return res.status(400).json({ message: 'Employee ID and updated data are required.' });
    }

    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ message: 'Error reading data' });
        }

        let employees = [];
        try {

            employees = JSON.parse(data).employees;
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            return res.status(500).json({ message: 'Error parsing data' });
        }

        const employeeIndex = employees.findIndex(emp => emp.id === parseInt(id));

        if (employeeIndex === -1) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        employees[employeeIndex] = { ...employees[employeeIndex], ...updatedEmployee };

        const updatedData = { employees };

        fs.writeFile(database, JSON.stringify(updatedData, null, 2), (writeError) => {
            if (writeError) {
                console.error('Error writing to db.json:', writeError);
                return res.status(500).json({ message: 'Error saving data' });
            }
            return res.status(200).json({ message: 'Employee updated successfully.', employee: employees[employeeIndex] });
        });
    });
});



// Delete an employee

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Employee ID is required.' });
    }

    fs.readFile(database, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading db.json:', err);
            return res.status(500).json({ message: 'Error reading data' });
        }
        let employees = [];
        try {
            employees = JSON.parse(data).employees;
        } catch (parseError) {
            console.error('Error parsing db.json:', parseError);
            return res.status(500).json({ message: 'Error parsing data' });
        }
        const employeeIndex = employees.findIndex(emp => emp.id === parseInt(id));

        if (employeeIndex === -1) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        employees.splice(employeeIndex, 1);

        const updatedData = { employees };

        fs.writeFile(database, JSON.stringify(updatedData, null, 2), (writeError) => {
            if (writeError) {
                console.error('Error writing to db.json:', writeError);
                return res.status(500).json({ message: 'Error saving data' });
            }

            return res.status(200).json({ message: 'Employee deleted successfully.' });
        });
    });
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>{
    console.log(`Server running on PORT ${PORT}`);
})