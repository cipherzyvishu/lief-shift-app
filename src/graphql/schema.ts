import gql from 'graphql-tag'

export const typeDefs = gql`
    scalar DateTime
    
    enum Role {
        MANAGER
        CARE_WORKER
    }

    enum ShiftStatus {
        CLOCKED_IN
        CLOCKED_OUT
    }

    type User {
        id: ID!
        email: String!
        name: String
        role: Role!
        createdAt: DateTime!
        shifts: [Shift!]!
    }

    type Location {
        id: ID!
        name: String!
        latitude: Float!
        longitude: Float!
        radius: Int!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type Shift {
        id: ID!
        userId: String!
        locationId: String!
        clockInTime: DateTime!
        clockOutTime: DateTime
        clockInLat: Float!
        clockInLng: Float!
        clockOutLat: Float
        clockOutLng: Float
        clockInNote: String
        clockOutNote: String
        status: ShiftStatus!
        totalHours: Float
        createdAt: DateTime!
        updatedAt: DateTime!
        user: User!
        location: Location!
    }
    
    type Query {
        hello: String
        users: [User!]
        myActiveShift: Shift
    }
    `;