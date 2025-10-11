# CineTrack Project

## Overview
The CineTrack application is designed for users to be able to view both current and upcoming movies based on different categories.

## Project Framework
The backend of the project is using python and fastapi, while the frontend is using Next.js.

## ER Diagram
For the CineTrack app, there are three entieies and two relationships

### Entities
**Movie**
- movie_id
- title
- genre
- duration
- rating

**Theater**
- theater_id
- name
- location

**Customer**
- customer_id
- name
- email

### Relationships
**showtime**

This relationship is one-to-one between the theater and movie entities, and has its own attribute named start_time.



**booking**

This relationship is one-to-one between the customer entity and an aggregation of the showtime relationship, and has its own attribtues named booked_at and seat_number.

<img width="1740" height="1860" alt="Movie Theater ER Diagram" src="https://github.com/user-attachments/assets/059c0234-fc4f-4782-ae42-3d349726ddfd" />

## Instructions on how to start project
