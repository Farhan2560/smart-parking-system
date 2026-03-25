-- ============================================================
-- Urban Smart Parking System (USPS)
-- Sample Data — INSERT Statements
-- ============================================================

-- --------------------------------------------------------
-- Parking_Zone
-- --------------------------------------------------------
INSERT INTO Parking_Zone (Zone_ID, Zone_Name, Street, City, Zip_Code, Slot_Rate, Zone_Capacity)
VALUES
    (1, 'Zone A – Downtown',    '100 Main St',     'Springfield', '62701', 3.50, 50),
    (2, 'Zone B – Midtown',     '45 Broadway Ave',  'Springfield', '62702', 2.75, 80),
    (3, 'Zone C – Airport',     '1 Airport Rd',     'Capital City', '72001', 5.00, 120),
    (4, 'Zone D – Tech Park',   '300 Innovation Dr','Capital City', '72002', 4.00, 60);

-- --------------------------------------------------------
-- Parking_Slot
-- --------------------------------------------------------
INSERT INTO Parking_Slot (Slot_ID, Zone_ID, Slot_Number, Slot_Type, Slot_Status)
VALUES
    (101, 1, 'A-01', 'Standard',    'Available'),
    (102, 1, 'A-02', 'Compact',     'Occupied'),
    (103, 1, 'A-03', 'EV',          'Available'),
    (104, 1, 'A-04', 'Handicapped', 'Reserved'),
    (201, 2, 'B-01', 'Standard',    'Available'),
    (202, 2, 'B-02', 'Standard',    'Occupied'),
    (203, 2, 'B-03', 'Compact',     'Available'),
    (301, 3, 'C-01', 'Standard',    'Available'),
    (302, 3, 'C-02', 'EV',          'Available'),
    (401, 4, 'D-01', 'Standard',    'Inactive');

-- --------------------------------------------------------
-- Driver
-- --------------------------------------------------------
INSERT INTO Driver (Driver_ID, First_Name, Last_Name, Email, License_Number)
VALUES
    (1, 'Alice',   'Johnson',  'alice.johnson@email.com',  'DL-IL-100001'),
    (2, 'Bob',     'Smith',    'bob.smith@email.com',      'DL-IL-100002'),
    (3, 'Carol',   'Williams', 'carol.williams@email.com', 'DL-CC-200001'),
    (4, 'David',   'Brown',    'david.brown@email.com',    'DL-CC-200002');

-- --------------------------------------------------------
-- Driver_Contact  (multivalued Contact_Numbers)
-- --------------------------------------------------------
INSERT INTO Driver_Contact (Contact_ID, Driver_ID, Contact_Number, Contact_Type)
VALUES
    (1, 1, '217-555-0101', 'Mobile'),
    (2, 1, '217-555-0102', 'Home'),
    (3, 2, '217-555-0201', 'Mobile'),
    (4, 3, '501-555-0301', 'Mobile'),
    (5, 3, '501-555-0302', 'Emergency'),
    (6, 4, '501-555-0401', 'Mobile'),
    (7, 4, '501-555-0402', 'Work');

-- --------------------------------------------------------
-- Vehicle
-- --------------------------------------------------------
INSERT INTO Vehicle (Vehicle_ID, Driver_ID, License_Plate, Vehicle_Model, Fuel_Type)
VALUES
    (1, 1, 'IL-ABC-1234', 'Toyota Corolla 2022',   'Petrol'),
    (2, 1, 'IL-XYZ-5678', 'Nissan Leaf 2023',      'Electric'),
    (3, 2, 'IL-DEF-9012', 'Honda Civic 2021',      'Petrol'),
    (4, 3, 'CC-GHI-3456', 'Ford Explorer 2020',    'Diesel'),
    (5, 3, 'CC-JKL-7890', 'Tesla Model 3 2023',    'Electric'),
    (6, 4, 'CC-MNO-2345', 'Toyota Prius 2022',     'Hybrid');

-- --------------------------------------------------------
-- Parking_Session
-- (Total_Duration and Total_Bill are derived — not stored)
-- --------------------------------------------------------
INSERT INTO Parking_Session (Session_ID, Vehicle_ID, Slot_ID, Entry_Time, Exit_Time)
VALUES
    (1001, 1, 101, '2024-03-10 08:00:00', '2024-03-10 10:30:00'),  -- completed session
    (1002, 3, 202, '2024-03-10 09:00:00', '2024-03-10 11:00:00'),  -- completed session
    (1003, 2, 102, '2024-03-10 10:00:00', NULL),                   -- active session
    (1004, 5, 301, '2024-03-10 07:30:00', '2024-03-10 09:00:00'),  -- completed session
    (1005, 4, 203, '2024-03-10 11:00:00', '2024-03-10 13:30:00');  -- completed session

-- --------------------------------------------------------
-- Payment
-- --------------------------------------------------------
INSERT INTO Payment (Payment_ID, Session_ID, Amount, Payment_Method, Payment_Status, Payment_Time)
VALUES
    (5001, 1001, 8.75,  'Card',   'Completed', '2024-03-10 10:32:00'),
    (5002, 1002, 5.50,  'UPI',    'Completed', '2024-03-10 11:05:00'),
    (5003, 1004, 7.50,  'Wallet', 'Completed', '2024-03-10 09:03:00'),
    (5004, 1005, 10.00, 'Cash',   'Completed', '2024-03-10 13:35:00');
-- Session 1003 has no payment yet (still active)
