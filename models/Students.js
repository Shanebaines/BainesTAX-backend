import mongoose from 'mongoose';

// Define schema & model ONCE (not inside the route)
const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
});

const Student = mongoose.model('Student', studentSchema);

export default Student;