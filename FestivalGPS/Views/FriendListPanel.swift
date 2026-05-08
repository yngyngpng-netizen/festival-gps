import SwiftUI

struct FriendListPanel: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Environment(\.dismiss) private var dismiss
    @Binding var selectedFriendID: Friend.ID?

    var body: some View {
        NavigationStack {
            List {
                ForEach(store.friends) { friend in
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) {
                            selectedFriendID = friend.id
                        }
                        dismiss()
                    } label: {
                        HStack(spacing: 12) {
                            AvatarCircle(friend: friend, size: 42)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(friend.name)
                                    .font(.headline)
                                    .foregroundStyle(.primary)
                                Text(store.statusText(for: friend))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(1)
                            }

                            Spacer()

                            Image(systemName: selectedFriendID == friend.id ? "location.fill" : "location")
                                .foregroundStyle(Color(hex: friend.colorHex))
                        }
                    }
                }
            }
            .navigationTitle("Friends")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}
