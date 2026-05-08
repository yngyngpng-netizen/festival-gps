import Foundation

struct FestivalStage: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let normalizedX: Double
    let normalizedY: Double
    let colorHex: String
}

enum FestivalDay: String, CaseIterable, Identifiable, Codable, Hashable {
    case friday = "Friday"
    case saturday = "Saturday"
    case sunday = "Sunday"

    var id: String { rawValue }

    var dateLabel: String {
        switch self {
        case .friday:
            return "May 15"
        case .saturday:
            return "May 16"
        case .sunday:
            return "May 17"
        }
    }

    var startMinute: Int {
        switch self {
        case .friday:
            return 17 * 60
        case .saturday, .sunday:
            return 19 * 60
        }
    }

    var endMinute: Int {
        (24 * 60) + (5 * 60) + 30
    }

    var sliderRange: ClosedRange<Double> {
        Double(startMinute)...Double(endMinute)
    }
}

struct ScheduleEvent: Identifiable, Hashable, Codable {
    var id: UUID
    var artist: String
    var stageID: String
    var day: FestivalDay
    var startMinute: Int
    var endMinute: Int

    init(
        id: UUID = UUID(),
        artist: String,
        stageID: String,
        day: FestivalDay,
        startMinute: Int,
        endMinute: Int
    ) {
        self.id = id
        self.artist = artist
        self.stageID = stageID
        self.day = day
        self.startMinute = startMinute
        self.endMinute = endMinute
    }

    func contains(day selectedDay: FestivalDay, minute: Int) -> Bool {
        day == selectedDay && startMinute <= minute && minute <= endMinute
    }
}

struct Friend: Identifiable, Hashable {
    var id: UUID
    var name: String
    var handle: String
    var colorHex: String
    var profileImageData: Data?
    var schedule: [ScheduleEvent]

    init(
        id: UUID = UUID(),
        name: String,
        handle: String,
        colorHex: String,
        profileImageData: Data? = nil,
        schedule: [ScheduleEvent]
    ) {
        self.id = id
        self.name = name
        self.handle = handle
        self.colorHex = colorHex
        self.profileImageData = profileImageData
        self.schedule = schedule
    }

    var initials: String {
        let parts = name
            .split(separator: " ")
            .prefix(2)
            .compactMap { $0.first }
        let initials = String(parts).uppercased()
        return initials.isEmpty ? "?" : initials
    }
}
