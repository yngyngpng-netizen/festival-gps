import PhotosUI
import SwiftUI
import UIKit

struct ScheduleUploadSheet: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Environment(\.dismiss) private var dismiss
    @State private var selectedDay: FestivalDay = .friday
    @State private var selectedItem: PhotosPickerItem?
    @State private var imageData: Data?
    @State private var recognizedText = ""
    @State private var parsedEvents: [ScheduleEvent] = []
    @State private var isReading = false
    @State private var message: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Festival day", selection: $selectedDay) {
                        ForEach(FestivalDay.allCases) { day in
                            Text("\(day.rawValue) \(day.dateLabel)").tag(day)
                        }
                    }

                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        Label("Schedule screenshot", systemImage: "photo.badge.plus")
                    }

                    Button {
                        loadDemoSchedule()
                    } label: {
                        Label("Demo schedule", systemImage: "sparkles")
                    }
                }

                if let imageData, let image = UIImage(data: imageData) {
                    Section {
                        Image(uiImage: image)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                }

                if isReading {
                    Section {
                        ProgressView("Reading schedule")
                    }
                }

                if let message {
                    Section {
                        Text(message)
                            .font(.callout)
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Generated schedule") {
                    if parsedEvents.isEmpty {
                        Text("No events yet")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(parsedEvents) { event in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.artist)
                                    .font(.headline)
                                Text("\(ScheduleParser.timeLabel(for: event.startMinute)) - \(ScheduleParser.timeLabel(for: event.endMinute)) • \(StageDirectory.stage(for: event.stageID).name)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Import Schedule")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Use") {
                        store.replaceCurrentUserSchedule(with: parsedEvents)
                        dismiss()
                    }
                    .disabled(parsedEvents.isEmpty)
                }
            }
            .onChange(of: selectedItem) { _, newItem in
                Task {
                    await loadSchedule(from: newItem)
                }
            }
            .onChange(of: selectedDay) { _, newDay in
                guard !recognizedText.isEmpty else { return }
                parsedEvents = ScheduleParser.parseSchedule(from: recognizedText, defaultDay: newDay)
            }
        }
    }

    @MainActor
    private func loadSchedule(from item: PhotosPickerItem?) async {
        guard let item else { return }
        isReading = true
        message = nil
        parsedEvents = []

        do {
            guard let data = try await item.loadTransferable(type: Data.self) else {
                message = "The selected image was empty."
                isReading = false
                return
            }

            imageData = data
            recognizedText = try await ScheduleImageReader.recognizeText(from: data)
            parsedEvents = ScheduleParser.parseSchedule(from: recognizedText, defaultDay: selectedDay)
            message = parsedEvents.isEmpty ? "No stage and time matches were found." : "\(parsedEvents.count) sets generated."
        } catch {
            message = error.localizedDescription
        }

        isReading = false
    }

    private func loadDemoSchedule() {
        recognizedText = """
        Friday May 15
        8:00 PM - 9:00 PM House Warmup Stereo Bloom
        9:30 PM - 10:45 PM Mainstage Set Kinetic Field
        11:30 PM - 12:30 AM Bass Meetup Basspod
        1:00 AM - 2:00 AM Neon Finale Neon Garden
        """
        parsedEvents = ScheduleParser.parseSchedule(from: recognizedText, defaultDay: selectedDay)
        message = "\(parsedEvents.count) demo sets generated."
    }
}
