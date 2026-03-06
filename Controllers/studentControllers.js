import students from '../models/Students.js';

export const getStudents = (req, res) => { 
    students.find().then((studentsList) => {
        res.json(studentsList);
    }).catch((error) => {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Error fetching student data', error: error.message });
    });
}       

export const createStudent = (req, res) => {
    const student = new students(req.body);     
    student.save().then(() => {
        res.json({ message: 'Student data received and saved', data: req.body });
    }).catch((error) => {
        console.error('Error saving student data:', error);
        res.status(500).json({ message: 'Error saving student data', error: error.message });
    });
}

export const deleteStudent = (req, res) => {
    const studentId = req.params.id;    
    students.findByIdAndDelete(studentId).then(() => {
        res.json({ message: 'Student data deleted successfully' });
    }).catch((error) => {
        console.error('Error deleting student data:', error);
        res.status(500).json({ message: 'Error deleting student data', error: error.message });
    });
}