import type { Trip, Vehicle, VehicleEvent } from '../types'

export const vehicles: Vehicle[] = [
  { id: 'v1', name: 'Sprinter 314', plate: 'BG-482-KR', speed: 62, updated: 'just now', online: true, fuelLevel: 68, coolantTemperature: 88, signalStrength: 87, x: 46, y: 52 },
  { id: 'v2', name: 'Transit L2H2', plate: 'NS-118-AC', speed: 0, updated: '2 min ago', online: true, fuelLevel: 42, coolantTemperature: 72, signalStrength: 74, x: 22, y: 30 },
  { id: 'v3', name: 'Daily 35S', plate: 'BG-903-ME', speed: 41, updated: '1 min ago', online: true, fuelLevel: 76, coolantTemperature: 91, signalStrength: 92, x: 70, y: 27 },
  { id: 'v4', name: 'Vito 116', plate: 'KG-221-TT', speed: 18, updated: '4 min ago', online: true, fuelLevel: 55, coolantTemperature: 84, signalStrength: 68, x: 78, y: 63 },
  { id: 'v5', name: 'Crafter 2.0', plate: 'NI-774-PL', speed: 0, updated: '1 h ago', online: false, fuelLevel: 31, coolantTemperature: 38, signalStrength: 0, x: 33, y: 74 },
  { id: 'v6', name: 'Ducato 35', plate: 'SU-560-OD', speed: 0, updated: '3 h ago', online: false, fuelLevel: 63, coolantTemperature: 31, signalStrength: 0, x: 60, y: 82 },
  { id: 'v7', name: 'Boxer L3H2', plate: 'BG-315-VT', speed: 54, updated: 'just now', online: true, fuelLevel: 47, coolantTemperature: 86, signalStrength: 81, x: 18, y: 58 },
  { id: 'v8', name: 'Master 2.3', plate: 'NS-642-RN', speed: 29, updated: '1 min ago', online: true, fuelLevel: 59, coolantTemperature: 82, signalStrength: 77, x: 83, y: 43 },
  { id: 'v9', name: 'Transporter T6', plate: 'BG-728-GL', speed: 0, updated: '5 min ago', online: true, fuelLevel: 81, coolantTemperature: 67, signalStrength: 64, x: 41, y: 21 },
  { id: 'v10', name: 'Jumper 35', plate: 'KG-194-JM', speed: 36, updated: '2 min ago', online: true, fuelLevel: 38, coolantTemperature: 89, signalStrength: 73, x: 67, y: 69 },
  { id: 'v11', name: 'Movano L2H2', plate: 'NI-405-MV', speed: 0, updated: '6 h ago', online: false, fuelLevel: 52, coolantTemperature: 27, signalStrength: 0, x: 27, y: 86 },
  { id: 'v12', name: 'Caddy Cargo', plate: 'SU-833-CD', speed: 0, updated: '8 h ago', online: false, fuelLevel: 24, coolantTemperature: 25, signalStrength: 0, x: 88, y: 77 },
]

export const baseTrips: Trip[] = [
  { id: 'live', date: 'Today', time: '14:05 — now', duration: '2 h 12 min', distance: '38.4 km', from: 'Depot Zvezdara', live: true },
  { id: 't1', date: 'Today', time: '08:12 — 10:04', duration: '1 h 52 min', distance: '31.7 km', from: 'Novi Beograd', to: 'Dorćol' },
  { id: 't2', date: 'Yesterday', time: '16:30 — 17:41', duration: '1 h 11 min', distance: '24.2 km', from: 'Zemun', to: 'Nikola Tesla Airport' },
  { id: 't3', date: 'Sep 27', time: '11:06 — 13:18', duration: '2 h 12 min', distance: '42.9 km', from: 'Voždovac', to: 'Depot Zvezdara' },
  { id: 't4', date: 'Sep 26', time: '07:48 — 09:22', duration: '1 h 34 min', distance: '28.6 km', from: 'Karaburma', to: 'Novi Beograd' },
  { id: 't5', date: 'Sep 25', time: '13:15 — 14:03', duration: '48 min', distance: '16.1 km', from: 'Dorćol', to: 'Zemun' },
  { id: 't6', date: 'Sep 24', time: '09:04 — 11:37', duration: '2 h 33 min', distance: '51.8 km', from: 'Depot Zvezdara', to: 'Surčin' },
  { id: 't7', date: 'Sep 23', time: '15:26 — 16:42', duration: '1 h 16 min', distance: '22.5 km', from: 'Čukarica', to: 'Palilula' },
  { id: 't8', date: 'Sep 22', time: '06:55 — 08:31', duration: '1 h 36 min', distance: '34.7 km', from: 'Novi Beograd', to: 'Voždovac' },
  { id: 't9', date: 'Sep 21', time: '12:18 — 13:09', duration: '51 min', distance: '18.3 km', from: 'Zemun', to: 'Depot Zvezdara' },
]

export const vehicleEvents: VehicleEvent[] = [
  { kind: 'Harsh braking', tone: 'danger', time: '14:52', where: 'Bulevar Kralja Aleksandra' },
  { kind: 'Speeding', tone: 'warning', time: '14:39', where: 'E75, km 18' },
  { kind: 'Harsh acceleration', tone: 'warning', time: '14:21', where: 'Vojvode Stepe' },
  { kind: 'Idling 6 min', tone: 'muted', time: '13:58', where: 'Depot Zvezdara' },
]

export const routePoints = [
  [18, 76], [20, 72], [23, 68], [26, 63], [30, 59], [34, 56], [38, 54], [42, 52],
  [46, 49], [49, 45], [52, 40], [56, 38], [60, 34], [65, 31], [70, 27],
] as const
