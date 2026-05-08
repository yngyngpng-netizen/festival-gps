import SwiftUI

@main
struct FestivalGPSApp: App {
    @StateObject private var store = FestivalGPSStore()

    var body: some Scene {
        WindowGroup {
            FestivalMapScreen()
                .environmentObject(store)
        }
    }
}
