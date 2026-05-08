import PhotosUI
import SwiftUI
import UIKit

struct ProfileSheet: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var selectedItem: PhotosPickerItem?
    @State private var profileImageData: Data?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack(spacing: 14) {
                        AvatarCircle(
                            friend: Friend(
                                name: name.isEmpty ? store.currentUser.name : name,
                                handle: store.currentUser.handle,
                                colorHex: store.currentUser.colorHex,
                                profileImageData: profileImageData ?? store.currentUser.profileImageData,
                                schedule: store.currentUser.schedule
                            ),
                            size: 72
                        )

                        PhotosPicker(selection: $selectedItem, matching: .images) {
                            Label("Profile picture", systemImage: "person.crop.circle.badge.plus")
                        }
                    }

                    TextField("Name", text: $name)
                        .textInputAutocapitalization(.words)
                }

                Section("Current schedule") {
                    if store.currentUser.schedule.isEmpty {
                        Text("No sets imported")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(store.currentUser.schedule) { event in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(event.artist)
                                    .font(.headline)
                                Text("\(event.day.rawValue) • \(ScheduleParser.timeLabel(for: event.startMinute)) • \(StageDirectory.stage(for: event.stageID).name)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        store.updateCurrentUserName(name)
                        if let profileImageData {
                            store.updateCurrentUserProfile(imageData: profileImageData)
                        }
                        dismiss()
                    }
                }
            }
            .onAppear {
                name = store.currentUser.name
                profileImageData = store.currentUser.profileImageData
            }
            .onChange(of: selectedItem) { _, newItem in
                Task {
                    await loadProfileImage(from: newItem)
                }
            }
        }
    }

    @MainActor
    private func loadProfileImage(from item: PhotosPickerItem?) async {
        guard let item else { return }
        profileImageData = try? await item.loadTransferable(type: Data.self)
    }
}
