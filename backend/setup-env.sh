#!/bin/bash

# Create .env file for backend
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb+srv://iymfpanathur_db_user:TlPQctbpVzXUnYBl@cluster0.xug7orv.mongodb.net/book-distribution?retryWrites=true&w=majority
EOF

echo ".env file created successfully!"

