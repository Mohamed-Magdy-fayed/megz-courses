import { Typography } from '../ui/Typoghraphy'
import CourseSearchBar from './CourseSearchBar'
import HeroSvg from '../svgs/HeroSvg'

const HeroSection = () => {
    return (
        <section className="min-h-[80vh] grid place-content-center">
            <div className="grid grid-cols-12 p-4 xl:gap-8">
                <div className="col-span-12 lg:col-span-6">
                    <div>
                        <HeroSvg />
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-6 grid p-4 place-content-center">
                    <div className="-translate-y-20 lg:-translate-y-0 flex flex-col gap-8">
                        <Typography variant={"primary"} className="ml-auto lg:ml-0 !text-[clamp(1.75rem,6vw,3.5rem)] first-letter:text-primary whitespace-nowrap">
                            Megz Learning
                        </Typography>
                        <Typography>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus expedita nam dignissimos facere quia eius.
                        </Typography>
                        <div className="w-max">
                            <CourseSearchBar />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection