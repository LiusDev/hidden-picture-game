import HiddenPictureGame from "@/components/hidden-picture-game"

export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center mb-8">
				Group 10 - Truy Tìm Kho Báu
			</h1>
			<HiddenPictureGame />
		</main>
	)
}
