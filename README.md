Great, this ERD is **very solid**, and your tech stack is clear.
Below is a **production-grade backend project structure** for **Node.js + Express + PostgreSQL (Supabase)** that maps **directly to your ERD and feature list**.

I’ll give you:

1. **Folder structure (complete)**
2. **Model layer (per table)**
3. **Controller layer**
4. **Service layer (business logic)**
5. **Routes**
6. **Middleware**
7. **DB config (Supabase/Postgres)**
8. **Auth + role enforcement**
9. **Commute + Fair Rent hooks**
10. **How everything connects**

All files are **JavaScript (.js)**.

---

# 1️⃣ Backend Project Structure

```bash
roomlagbe-backend/
│
├── src/
│   ├── app.js
│   ├── server.js
│
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── supabase.js
│
│   ├── models/
│   │   ├── user.model.js
│   │   ├── apartment.model.js
│   │   ├── room.model.js
│   │   ├── listing.model.js
│   │   ├── booking.model.js
│   │   ├── location.model.js
│   │   ├── university.model.js
│   │   ├── commute.model.js
│   │   ├── amenity.model.js
│   │   ├── listingPhoto.model.js
│   │   └── wishlist.model.js
│
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── listing.controller.js
│   │   ├── apartment.controller.js
│   │   ├── room.controller.js
│   │   ├── booking.controller.js
│   │   ├── commute.controller.js
│   │   ├── wishlist.controller.js
│   │   └── analytics.controller.js
│
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── listing.service.js
│   │   ├── apartment.service.js
│   │   ├── booking.service.js
│   │   ├── commute.service.js
│   │   ├── fairRent.service.js
│   │   └── search.service.js
│
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── listing.routes.js
│   │   ├── apartment.routes.js
│   │   ├── booking.routes.js
│   │   ├── commute.routes.js
│   │   ├── wishlist.routes.js
│   │   └── analytics.routes.js
│
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── distance.js
│   │   └── response.js
│
│   └── constants/
│       ├── roles.js
│       └── listingStatus.js
│
├── package.json
└── .env
```

---

# 2️⃣ Database Configuration (Supabase / PostgreSQL)

### `src/config/db.js`

```js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

---

# 3️⃣ Models (1 file = 1 table)

### `src/models/user.model.js`

```js
import { pool } from '../config/db.js';

export const UserModel = {
  create: async (data) => {
    const query = `
      INSERT INTO "USER"(name, email, phone, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [data.name, data.email, data.phone, data.role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByEmail: async (email) => {
    const { rows } = await pool.query(
      `SELECT * FROM "USER" WHERE email=$1`, [email]
    );
    return rows[0];
  }
};
```

---

### `src/models/listing.model.js`

```js
import { pool } from '../config/db.js';

export const ListingModel = {
  create: async (data) => {
    const query = `
      INSERT INTO LISTING
      (apartment_id, room_id, listing_type, price_per_person, availability_status, women_only)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;
    const values = [
      data.apartment_id,
      data.room_id,
      data.listing_type,
      data.price_per_person,
      data.availability_status,
      data.women_only
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findAll: async () => {
    const { rows } = await pool.query(`SELECT * FROM LISTING`);
    return rows;
  }
};
```

---

# 4️⃣ Services (Business Logic)

### `src/services/listing.service.js`

```js
import { ListingModel } from '../models/listing.model.js';

export const ListingService = {
  createListing: async (payload) => {
    // extra validation or rules can go here
    return await ListingModel.create(payload);
  },

  getAllListings: async () => {
    return await ListingModel.findAll();
  }
};
```

---

### `src/services/commute.service.js`

```js
import axios from 'axios';

export const CommuteService = {
  calculateWalkingTime: async (from, to) => {
    // OpenStreetMap / OSRM API
    const url = `https://router.project-osrm.org/route/v1/walking/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;

    const { data } = await axios.get(url);
    return {
      distance_km: data.routes[0].distance / 1000,
      walking_time: Math.round(data.routes[0].duration / 60)
    };
  }
};
```

---

# 5️⃣ Controllers (HTTP logic only)

### `src/controllers/listing.controller.js`

```js
import { ListingService } from '../services/listing.service.js';

export const ListingController = {
  create: async (req, res, next) => {
    try {
      const listing = await ListingService.createListing(req.body);
      res.status(201).json(listing);
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req, res, next) => {
    try {
      const listings = await ListingService.getAllListings();
      res.json(listings);
    } catch (err) {
      next(err);
    }
  }
};
```

---

# 6️⃣ Routes

### `src/routes/listing.routes.js`

```js
import express from 'express';
import { ListingController } from '../controllers/listing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', ListingController.getAll);
router.post('/', authenticate, ListingController.create);

export default router;
```

---

# 7️⃣ Authentication & Role Middleware

### `src/middleware/auth.middleware.js`

```js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};
```

---

### `src/middleware/role.middleware.js`

```js
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};
```

---

# 8️⃣ App Entry

### `src/app.js`

```js
import express from 'express';
import listingRoutes from './routes/listing.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);

export default app;
```

---

### `src/server.js`

```js
import app from './app.js';

app.listen(5000, () => {
  console.log('RoomLagbe backend running on port 5000');
});
```

---

# 9️⃣ How This Maps to Your ERD

| ERD Entity    | Backend Layer         |
| ------------- | --------------------- |
| USER          | user.model.js         |
| APARTMENT     | apartment.model.js    |
| ROOM          | room.model.js         |
| LISTING       | listing.model.js      |
| BOOKING       | booking.model.js      |
| COMMUTE_TIME  | commute.model.js      |
| UNIVERSITY    | university.model.js   |
| AMENITY       | amenity.model.js      |
| LISTING_PHOTO | listingPhoto.model.js |

---


