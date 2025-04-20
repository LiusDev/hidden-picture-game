import HiddenPictureGame from "@/components/hidden-picture-game"

export default function Home() {
	return (
		<main className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold text-center mb-8">
				Nhóm 10 - Đi tìm ô chữ có 16 chữ cái
			</h1>
			<HiddenPictureGame />
		</main>
	)
}
