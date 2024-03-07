
# Parking Lot Management System

A simple Node.js application for managing parking lots, parking slots, and parked vehicles.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/basitarshad/parking_lot.git
   ```

2. Navigate to the project directory:

   ```
   cd parking_lot
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Create a SQLite database file named `parking_lot.db` in the root directory of the project.

## Usage

1. Start the server:

   ```
   node app.js
   ```

2. Use HTTP client tools like Postman or cURL to interact with the API endpoints. Refer to the [Endpoints](#endpoints) section for available endpoints and their usage.

## Endpoints

- **Create Parking Lot**:
  - Method: POST
  - Endpoint: `/parking-lots`
  - Description: Create a new parking lot with a specified name and total number of slots.

- **Park Vehicle**:
  - Method: POST
  - Endpoint: `/parking-lots/:id/park`
  - Description: Park a vehicle in a specific parking lot.

- **Unpark Vehicle**:
  - Method: POST
  - Endpoint: `/parking-lots/:id/unpark`
  - Description: Unpark a vehicle from a specific parking lot.

- **Set Slot to Maintenance**:
  - Method: POST
  - Endpoint: `/parking-lots/:id/slot/:slotNumber/maintenance`
  - Description: Set a parking slot to maintenance mode.

- **Set Slot to Working**:
  - Method: POST
  - Endpoint: `/parking-lots/:id/slot/:slotNumber/working`
  - Description: Set a parking slot back to working mode after maintenance.

- **Get Total Vehicles Parked**:
  - Method: GET
  - Endpoint: `/parking-lots/:id/total-parked`
  - Description: Get the total number of vehicles parked in a specific parking lot.

- **Get Total Parking Time**:
  - Method: GET
  - Endpoint: `/parking-lots/:id/total-parking-time`
  - Description: Get the total parking time in hours for all vehicles parked in a specific parking lot.

- **Get Total Fee Collected**:
  - Method: GET
  - Endpoint: `/parking-lots/:id/total-fee`
  - Description: Get the total fee collected for parking in a specific parking lot.

## Technologies Used

- Node.js
- Express.js
- Sequelize (ORM)
- SQLite (Database)
- Body-parser (Middleware)

## License

This project is licensed under the [MIT License](LICENSE).
