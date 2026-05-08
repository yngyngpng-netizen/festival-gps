import SwiftUI
import UIKit

struct TimelineControl: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Binding var selectedFriendID: Friend.ID?

    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Picker("Day", selection: Binding(
                    get: { store.selectedDay },
                    set: { store.setSelectedDay($0) }
                )) {
                    ForEach(FestivalDay.allCases) { day in
                        Text(String(day.rawValue.prefix(3))).tag(day)
                    }
                }
                .pickerStyle(.segmented)

                Text(store.formattedSelectedTime())
                    .font(.system(.body, design: .rounded).weight(.bold))
                    .monospacedDigit()
                    .foregroundStyle(.white)
                    .frame(minWidth: 86, alignment: .trailing)
            }

            Slider(
                value: Binding(
                    get: { store.selectedMinute },
                    set: { newValue in
                        withAnimation(.spring(response: 0.38, dampingFraction: 0.82)) {
                            store.selectedMinute = newValue
                        }
                    }
                ),
                in: store.selectedDay.sliderRange,
                step: 5
            )
            .tint(Color(hex: "#53E2FF"))

            HStack {
                Text(ScheduleParser.timeLabel(for: store.selectedDay.startMinute))
                Spacer()
                Text(ScheduleParser.timeLabel(for: store.selectedDay.endMinute))
            }
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.white.opacity(0.70))

            FriendTimelineStrip(selectedFriendID: $selectedFriendID)
                .environmentObject(store)
        }
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
    }
}

private struct FriendTimelineStrip: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Binding var selectedFriendID: Friend.ID?

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(store.friends) { friend in
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) {
                            selectedFriendID = friend.id
                        }
                    } label: {
                        HStack(spacing: 8) {
                            AvatarCircle(friend: friend, size: 30)
                            VStack(alignment: .leading, spacing: 1) {
                                Text(friend.name)
                                    .font(.caption.weight(.bold))
                                    .lineLimit(1)
                                Text(store.statusText(for: friend))
                                    .font(.caption2)
                                    .foregroundStyle(.white.opacity(0.68))
                                    .lineLimit(1)
                            }
                        }
                        .foregroundStyle(.white)
                        .padding(.leading, 6)
                        .padding(.trailing, 10)
                        .padding(.vertical, 6)
                        .frame(width: 170, alignment: .leading)
                        .background(
                            selectedFriendID == friend.id ? Color.white.opacity(0.18) : Color.white.opacity(0.08),
                            in: RoundedRectangle(cornerRadius: 8, style: .continuous)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct AvatarCircle: View {
    let friend: Friend
    let size: CGFloat

    var body: some View {
        ZStack {
            if let data = friend.profileImageData, let image = UIImage(data: data) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Color(hex: friend.colorHex)
                Text(friend.initials)
                    .font(.system(size: size * 0.34, weight: .black))
                    .foregroundStyle(.black.opacity(0.78))
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(Circle().stroke(Color(hex: friend.colorHex), lineWidth: 2))
    }
}
