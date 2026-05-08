import SwiftUI
import UIKit

struct PinView: View {
    let friend: Friend
    let status: String
    let isSelected: Bool

    var body: some View {
        VStack(spacing: 4) {
            ZStack(alignment: .bottomTrailing) {
                avatar
                    .frame(width: isSelected ? 58 : 48, height: isSelected ? 58 : 48)
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .stroke(Color(hex: friend.colorHex), lineWidth: isSelected ? 4 : 3)
                    )
                    .shadow(color: Color(hex: friend.colorHex).opacity(0.75), radius: isSelected ? 16 : 10)

                Circle()
                    .fill(Color(hex: friend.colorHex))
                    .frame(width: 14, height: 14)
                    .overlay(Circle().stroke(.white, lineWidth: 2))
                    .offset(x: 2, y: 2)
            }

            VStack(spacing: 1) {
                Text(friend.name)
                    .font(.caption2.weight(.bold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
                if isSelected {
                    Text(status)
                        .font(.system(size: 9, weight: .medium))
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                        .foregroundStyle(.white.opacity(0.82))
                }
            }
            .foregroundStyle(.white)
            .padding(.horizontal, 7)
            .padding(.vertical, 4)
            .frame(width: isSelected ? 148 : 78)
            .background(.black.opacity(isSelected ? 0.62 : 0.42), in: RoundedRectangle(cornerRadius: 8, style: .continuous))
        }
        .scaleEffect(isSelected ? 1.08 : 1.0)
        .zIndex(isSelected ? 10 : 1)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(friend.name), \(status)")
    }

    @ViewBuilder
    private var avatar: some View {
        if let data = friend.profileImageData, let image = UIImage(data: data) {
            Image(uiImage: image)
                .resizable()
                .scaledToFill()
        } else {
            ZStack {
                Color(hex: friend.colorHex)
                Text(friend.initials)
                    .font(.headline.weight(.black))
                    .foregroundStyle(.black.opacity(0.78))
            }
        }
    }
}
