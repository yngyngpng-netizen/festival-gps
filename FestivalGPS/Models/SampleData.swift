import Foundation

enum SampleData {
    static let friends: [Friend] = [
        Friend(
            name: "You",
            handle: "@you",
            colorHex: "#53E2FF",
            schedule: [
                ScheduleEvent(artist: "Opening Ceremony", stageID: "cosmic-meadow", day: .friday, startMinute: 17 * 60, endMinute: 19 * 60),
                ScheduleEvent(artist: "Demo Mainstage Set", stageID: "kinetic-field", day: .friday, startMinute: 21 * 60, endMinute: 22 * 60 + 15),
                ScheduleEvent(artist: "Late Night Techno", stageID: "neon-garden", day: .friday, startMinute: 24 * 60 + 45, endMinute: 26 * 60)
            ]
        ),
        Friend(
            name: "Maya Chen",
            handle: "@maya",
            colorHex: "#FF4FD8",
            schedule: [
                ScheduleEvent(artist: "House Warmup", stageID: "stereo-bloom", day: .friday, startMinute: 20 * 60, endMinute: 21 * 60),
                ScheduleEvent(artist: "Circuit Run", stageID: "circuit-grounds", day: .friday, startMinute: 22 * 60 + 20, endMinute: 23 * 60 + 30),
                ScheduleEvent(artist: "Trance Hour", stageID: "quantum-valley", day: .friday, startMinute: 24 * 60 + 30, endMinute: 25 * 60 + 30)
            ]
        ),
        Friend(
            name: "Leo Park",
            handle: "@leo",
            colorHex: "#A5FF5F",
            schedule: [
                ScheduleEvent(artist: "Bass Meetup", stageID: "basspod", day: .friday, startMinute: 20 * 60 + 30, endMinute: 21 * 60 + 30),
                ScheduleEvent(artist: "Hard Dance Block", stageID: "wasteland", day: .friday, startMinute: 23 * 60, endMinute: 24 * 60 + 15),
                ScheduleEvent(artist: "Afterglow", stageID: "art-cars", day: .friday, startMinute: 26 * 60, endMinute: 27 * 60)
            ]
        )
    ]
}
