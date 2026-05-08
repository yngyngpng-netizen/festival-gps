import CoreGraphics
import Foundation
import SwiftUI

@MainActor
final class FestivalGPSStore: ObservableObject {
    @Published var friends: [Friend] = SampleData.friends
    @Published var selectedDay: FestivalDay = .friday
    @Published var selectedMinute: Double = Double(FestivalDay.friday.startMinute)

    var currentUser: Friend {
        friends.first ?? Friend(name: "You", handle: "@you", colorHex: "#53E2FF", schedule: [])
    }

    func setSelectedDay(_ day: FestivalDay) {
        selectedDay = day
        selectedMinute = Double(min(max(Int(selectedMinute), day.startMinute), day.endMinute))
    }

    func updateCurrentUserName(_ name: String) {
        guard !friends.isEmpty else { return }
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        friends[0].name = trimmed.isEmpty ? "You" : trimmed
    }

    func updateCurrentUserProfile(imageData: Data?) {
        guard !friends.isEmpty else { return }
        friends[0].profileImageData = imageData
    }

    func replaceCurrentUserSchedule(with events: [ScheduleEvent]) {
        guard !friends.isEmpty else { return }
        friends[0].schedule = events.sorted { $0.startMinute < $1.startMinute }
    }

    func activeEvent(for friend: Friend, day: FestivalDay? = nil, minute: Int? = nil) -> ScheduleEvent? {
        let selectedDay = day ?? self.selectedDay
        let selectedMinute = minute ?? Int(self.selectedMinute)
        return friend.schedule.first { $0.contains(day: selectedDay, minute: selectedMinute) }
    }

    func displayEvent(for friend: Friend, day: FestivalDay? = nil, minute: Int? = nil) -> ScheduleEvent? {
        let selectedDay = day ?? self.selectedDay
        let selectedMinute = minute ?? Int(self.selectedMinute)
        let dayEvents = friend.schedule
            .filter { $0.day == selectedDay }
            .sorted { $0.startMinute < $1.startMinute }

        if let active = dayEvents.first(where: { $0.contains(day: selectedDay, minute: selectedMinute) }) {
            return active
        }

        if let upcoming = dayEvents.first(where: { $0.startMinute > selectedMinute }) {
            return upcoming
        }

        return dayEvents.last
    }

    func stageForPin(friend: Friend) -> FestivalStage {
        if let active = activeEvent(for: friend) {
            return StageDirectory.stage(for: active.stageID)
        }

        let dayEvents = friend.schedule
            .filter { $0.day == selectedDay }
            .sorted { $0.startMinute < $1.startMinute }

        guard let previous = dayEvents.last(where: { $0.endMinute < Int(selectedMinute) }) else {
            return StageDirectory.defaultStage
        }

        return StageDirectory.stage(for: previous.stageID)
    }

    func statusText(for friend: Friend) -> String {
        if let active = activeEvent(for: friend) {
            return "\(active.artist) • \(StageDirectory.stage(for: active.stageID).name)"
        }

        if let display = displayEvent(for: friend) {
            let prefix = display.startMinute > Int(selectedMinute) ? "Next" : "Last"
            return "\(prefix): \(display.artist)"
        }

        return "No schedule"
    }

    func formattedSelectedTime() -> String {
        ScheduleParser.timeLabel(for: Int(selectedMinute))
    }

    func friend(with id: Friend.ID?) -> Friend? {
        guard let id else { return nil }
        return friends.first { $0.id == id }
    }
}
