const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const candidateRoutes = require('./routes/candidate.routes');
const companyRoutes = require('./routes/company.routes');
const testRoutes = require('./routes/test.routes');
const adminRoutes = require('./routes/admin.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json());
app.use('/' + (process.env.UPLOAD_DIR || 'uploads'), express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);

module.exports = app;
