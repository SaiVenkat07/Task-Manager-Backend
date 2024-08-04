const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotEnv = require("dotenv");

const app = express();
const PORT = process.env.PORT || 7000;

dotEnv.config();

app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL)
   .then(() => console.log("Connected to MongoDB"))
   .catch((err) => console.error("Error connecting to MongoDB:", err));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Task Manager API',
      description: 'API for managing tasks',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
