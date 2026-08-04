import http from 'k6/http';
import { sleep, check } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 15 }, // Ramp-up: 0 to 15 virtual users
    { duration: '2m', target: 15 },  // Plateau: hold 15 VUs
    { duration: '30s', target: 0 },  // Ramp-down: cool-down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<250', 'p(99)<600'], // p95 must be < 250ms, p99 must be < 600ms
    'http_req_failed': ['rate<0.01'],                 // Less than 1% failure rate
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api/v1';

const SEARCH_QUERIES = ['server', 'ups', 'router', 'pdu', '192.168', 'rack', 'db'];

export default function () {
  // 1. Fetch Rooms (Dashboard Load)
  const roomsRes = http.get(`${BASE_URL}/rooms`);
  const roomsOk = check(roomsRes, {
    'rooms status is 200': (r) => r.status === 200,
    'rooms list is not empty': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body) && body.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  if (!roomsOk) {
    sleep(1);
    return;
  }

  const rooms = JSON.parse(roomsRes.body);
  const randomRoom = rooms[randomIntBetween(0, rooms.length - 1)];
  const roomId = randomRoom.id;

  sleep(randomIntBetween(1, 2));

  // 2. Load Room Details + Racks + Active Alarms (3D Viewport Init)
  const responses = http.batch([
    ['GET', `${BASE_URL}/rooms/${roomId}`],
    ['GET', `${BASE_URL}/rooms/${roomId}/racks`],
    ['GET', `${BASE_URL}/alarms/active`],
  ]);

  check(responses[0], { 'room detail is 200': (r) => r.status === 200 });
  check(responses[1], { 'room racks is 200': (r) => r.status === 200 });
  check(responses[2], { 'alarms active is 200': (r) => r.status === 200 });

  let racks = [];
  try {
    racks = JSON.parse(responses[1].body);
  } catch (e) {
    // If racks body parsing fails, log and exit loop iteration
    sleep(1);
    return;
  }

  if (!Array.isArray(racks) || racks.length === 0) {
    sleep(1);
    return;
  }

  sleep(randomIntBetween(2, 4));

  // 3. Perform search query (GIN Trigram index search)
  const randomSearch = SEARCH_QUERIES[randomIntBetween(0, SEARCH_QUERIES.length - 1)];
  const searchRes = http.get(`${BASE_URL}/rooms/${roomId}/racks/search?query=${randomSearch}`);
  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
  });

  sleep(randomIntBetween(1, 3));

  // 4. Inspect specific Rack & Device telemetry history
  const randomRack = racks[randomIntBetween(0, racks.length - 1)];
  const rackRes = http.get(`${BASE_URL}/racks/${randomRack.id}`);
  const rackOk = check(rackRes, {
    'rack detail is 200': (r) => r.status === 200,
  });

  if (rackOk) {
    let rackDetail;
    try {
      rackDetail = JSON.parse(rackRes.body);
    } catch (e) {
      sleep(1);
      return;
    }

    if (rackDetail && Array.isArray(rackDetail.devices) && rackDetail.devices.length > 0) {
      const randomDevice = rackDetail.devices[randomIntBetween(0, rackDetail.devices.length - 1)];
      
      // Fetch last 1 hour of telemetry history aggregated by 1 minute
      const historyRes = http.get(`${BASE_URL}/telemetry/history/${randomDevice.id}?interval=1%20minute`);
      check(historyRes, {
        'telemetry history is 200': (r) => r.status === 200,
      });
    }
  }

  sleep(randomIntBetween(3, 5));
}
