# workout-planner-capstone-server

This is a project for education purposes created by Evan Poe.

This is a json-server managed API meant for developing `workout-planner-client` projects.

Once started, this will run a local API server on `http://localhost:9090`.

If you navigate to the base URL there will be a HTML documentation page displayed.

There is one top level endpoint:

- /workouts

This endpoint supports GET, POST, PUT, PATCH and DELETE requests. For PUT, PATCH and DELETE requests you must supply the respective workout and type in the endpoint's path.

For example:

- GET /workouts
- GET /folders
- POST /workouts
- POST /folders
- PATCH /workouts/{type}/{difficulty}/
- PATCH /folders/{folder-id}/
- DELETE /notes/{note-id}/
- DELETE /folders/{folder-id}/

To start the server, run `npm start`.

The database is initiated from the `db.js` file whenever the server is started. No data is persisted after the server has been shut down.