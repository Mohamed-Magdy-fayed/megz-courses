import Copyright from '@/components/Copyright'
import { Progress } from '../ui/progress'
import { Typography } from '../ui/Typoghraphy'
import { LearningLayoutCourseType, LearningLayoutLevelType } from '@/components/LearningLayout/LearningLayout'
import { LearningBreadcrumb } from '@/components/LearningLayout/LearningBreadcrumb'
import Image from 'next/image'
import { SiteIdentity } from '@prisma/client'
import { LogoPrimary } from '@/components/layout/Logo'

const LandingFooter = ({ course, level, siteIdentity }: {
    level?: LearningLayoutLevelType;
    course: LearningLayoutCourseType;
    siteIdentity?: SiteIdentity;
}) => {
    if (!course) return <Typography>No Course Found!</Typography>;

    return (
        <div className='w-full'>
            <div className='p-4 max-w-7xl lg:mx-auto'>
                <div className='border-t border-primary grid grid-cols-12 space-y-12'>
                    <div className='pt-4 flex flex-col items-center justify-center gap-4 col-span-12 md:col-span-6'>
                        {siteIdentity?.logoPrimary ? (
                            <Image src={siteIdentity.logoPrimary} height={1000} width={1000} alt="Logo" className='w-24 rounded-full' />
                        ) : (
                            <LogoPrimary className='w-24 h-24' />
                        )}
                        <Typography variant={'primary'} className='whitespace-nowrap'>{course.name}</Typography>
                    </div>
                    <div className='col-span-12 md:col-span-6 flex flex-col gap-4 p-4'>
                        <div className='flex items-center gap-4'>
                            <Typography>Progress</Typography>
                            <Progress value={50} />
                        </div>
                        <div className='flex items-center justify-center gap-4'>
                            {!!level && <LearningBreadcrumb course={course} level={level} />}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex justify-center p-4 bg-foreground text-background'>
                <Copyright />
            </div>
        </div>
    )
}

export default LandingFooter