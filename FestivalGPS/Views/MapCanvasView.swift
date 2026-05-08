import SwiftUI

struct MapCanvasView: View {
    @EnvironmentObject private var store: FestivalGPSStore
    @Binding var selectedFriendID: Friend.ID?

    var body: some View {
        GeometryReader { proxy in
            let size = proxy.size

            ZStack {
                MapBackgroundView()

                StageMarkerLayer(size: size)

                ForEach(store.friends) { friend in
                    let stage = store.stageForPin(friend: friend)
                    let offset = pinOffset(for: friend, stage: stage)

                    PinView(
                        friend: friend,
                        status: store.statusText(for: friend),
                        isSelected: selectedFriendID == friend.id
                    )
                    .position(
                        x: CGFloat(stage.normalizedX) * size.width + offset.width,
                        y: CGFloat(stage.normalizedY) * size.height + offset.height
                    )
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.78)) {
                            selectedFriendID = friend.id
                        }
                    }
                    .animation(.spring(response: 0.48, dampingFraction: 0.82), value: store.selectedMinute)
                    .animation(.spring(response: 0.48, dampingFraction: 0.82), value: store.selectedDay)
                }
            }
        }
    }

    private func pinOffset(for friend: Friend, stage: FestivalStage) -> CGSize {
        let companions = store.friends.filter { store.stageForPin(friend: $0).id == stage.id }
        guard companions.count > 1, let index = companions.firstIndex(where: { $0.id == friend.id }) else {
            return .zero
        }

        let angle = (Double(index) / Double(companions.count)) * Double.pi * 2
        let radius: Double = 30
        return CGSize(width: CGFloat(cos(angle) * radius), height: CGFloat(sin(angle) * radius))
    }
}

private struct MapBackgroundView: View {
    var body: some View {
        ZStack {
            FallbackMapArt()

            if let url = StageDirectory.officialMapURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .empty:
                        Color.clear
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .overlay(Color.black.opacity(0.18))
                    case .failure:
                        Color.clear
                    @unknown default:
                        Color.clear
                    }
                }
            }
        }
        .ignoresSafeArea()
    }
}

private struct FallbackMapArt: View {
    var body: some View {
        Canvas { context, size in
            let background = CGRect(origin: .zero, size: size)
            context.fill(Path(background), with: .color(Color(red: 0.02, green: 0.02, blue: 0.06)))

            let ovalRect = CGRect(
                x: size.width * 0.09,
                y: size.height * 0.14,
                width: size.width * 0.82,
                height: size.height * 0.70
            )
            let speedway = Path(roundedRect: ovalRect, cornerRadius: min(size.width, size.height) * 0.22)
            context.fill(speedway, with: .color(Color(red: 0.07, green: 0.08, blue: 0.14)))
            context.stroke(speedway, with: .color(.white.opacity(0.16)), lineWidth: 4)

            let innerRect = ovalRect.insetBy(dx: size.width * 0.14, dy: size.height * 0.12)
            let infield = Path(roundedRect: innerRect, cornerRadius: min(size.width, size.height) * 0.16)
            context.fill(infield, with: .color(Color(red: 0.03, green: 0.03, blue: 0.08)))
            context.stroke(infield, with: .color(.white.opacity(0.10)), lineWidth: 2)

            var boulevard = Path()
            boulevard.move(to: CGPoint(x: size.width * 0.50, y: size.height * 0.88))
            boulevard.addCurve(
                to: CGPoint(x: size.width * 0.52, y: size.height * 0.24),
                control1: CGPoint(x: size.width * 0.42, y: size.height * 0.70),
                control2: CGPoint(x: size.width * 0.60, y: size.height * 0.45)
            )
            context.stroke(boulevard, with: .color(.white.opacity(0.14)), lineWidth: 18)
            context.stroke(boulevard, with: .color(Color(hex: "#53E2FF").opacity(0.45)), lineWidth: 3)

            var crossPath = Path()
            crossPath.move(to: CGPoint(x: size.width * 0.24, y: size.height * 0.50))
            crossPath.addCurve(
                to: CGPoint(x: size.width * 0.76, y: size.height * 0.52),
                control1: CGPoint(x: size.width * 0.42, y: size.height * 0.42),
                control2: CGPoint(x: size.width * 0.58, y: size.height * 0.61)
            )
            context.stroke(crossPath, with: .color(.white.opacity(0.12)), lineWidth: 14)
        }
        .background(
            LinearGradient(
                colors: [
                    Color(red: 0.02, green: 0.02, blue: 0.08),
                    Color(red: 0.08, green: 0.03, blue: 0.12),
                    Color(red: 0.02, green: 0.06, blue: 0.10)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .ignoresSafeArea()
    }
}

private struct StageMarkerLayer: View {
    let size: CGSize

    var body: some View {
        ForEach(StageDirectory.stages) { stage in
            VStack(spacing: 4) {
                Circle()
                    .fill(Color(hex: stage.colorHex))
                    .frame(width: 10, height: 10)
                    .shadow(color: Color(hex: stage.colorHex).opacity(0.8), radius: 8)

                Text(stage.name)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(.white.opacity(0.88))
                    .lineLimit(1)
                    .minimumScaleFactor(0.65)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 3)
                    .background(.black.opacity(0.42), in: Capsule())
            }
            .frame(width: 88)
            .position(x: CGFloat(stage.normalizedX) * size.width, y: CGFloat(stage.normalizedY) * size.height)
            .allowsHitTesting(false)
        }
    }
}
