import SwiftUI

struct FestivalMapScreen: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @State private var isScheduleImporterPresented = false
    @State private var isProfilePresented = false
    @State private var isFriendPanelPresented = false
    @State private var selectedFriendID: Friend.ID?

    var body: some View {
        ZStack {
            MapCanvasView(selectedFriendID: $selectedFriendID)
                .environmentObject(store)
                .ignoresSafeArea()
        }
        .safeAreaInset(edge: .top) {
            HeaderBar(
                selectedFriend: store.friend(with: selectedFriendID),
                showFriends: { isFriendPanelPresented = true },
                showProfile: { isProfilePresented = true },
                showScheduleImporter: { isScheduleImporterPresented = true }
            )
            .environmentObject(store)
            .padding(.horizontal)
            .padding(.top, 4)
            .padding(.bottom, 8)
        }
        .safeAreaInset(edge: .bottom) {
            TimelineControl(selectedFriendID: $selectedFriendID)
                .environmentObject(store)
                .padding(.horizontal)
                .padding(.bottom, 8)
        }
        .sheet(isPresented: $isScheduleImporterPresented) {
            ScheduleUploadSheet()
                .environmentObject(store)
        }
        .sheet(isPresented: $isProfilePresented) {
            ProfileSheet()
                .environmentObject(store)
        }
        .sheet(isPresented: $isFriendPanelPresented) {
            FriendListPanel(selectedFriendID: $selectedFriendID)
                .environmentObject(store)
                .presentationDetents([.medium, .large])
        }
    }
}

private struct HeaderBar: View {
    @EnvironmentObject private var store: FestivalGPSStore
    let selectedFriend: Friend?
    let showFriends: () -> Void
    let showProfile: () -> Void
    let showScheduleImporter: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text("Festival GPS")
                    .font(.headline)
                    .foregroundStyle(.white)
                Text("\(store.selectedDay.rawValue) \(store.selectedDay.dateLabel) • \(store.formattedSelectedTime())")
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.78))
            }

            Spacer()

            if let selectedFriend {
                Text(selectedFriend.name)
                    .font(.caption.weight(.semibold))
                    .lineLimit(1)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(.white.opacity(0.14), in: Capsule())
            }

            IconButton(systemName: "person.2.fill", action: showFriends, accessibilityLabel: "Friends")
            IconButton(systemName: "person.crop.circle.badge.plus", action: showProfile, accessibilityLabel: "Profile")
            IconButton(systemName: "photo.on.rectangle.angled", action: showScheduleImporter, accessibilityLabel: "Import schedule")
        }
        .padding(12)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct IconButton: View {
    let systemName: String
    let action: () -> Void
    let accessibilityLabel: String

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(width: 36, height: 36)
                .background(.white.opacity(0.14), in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel)
    }
}
