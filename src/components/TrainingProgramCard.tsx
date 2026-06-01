import type { ResolvedTrainingProgram } from '../lib/trainingEngine'

interface TrainingProgramCardProps {
  program: ResolvedTrainingProgram
  onOpenTrainingProgram: (programId: string) => void
}

export function TrainingProgramCard({
  program,
  onOpenTrainingProgram,
}: TrainingProgramCardProps) {
  const levelDots = Math.min(3, program.progress.lessonsTotal)
  const filledDots = Math.min(
    levelDots,
    Math.ceil(
      (program.progress.lessonsCompleted / Math.max(program.progress.lessonsTotal, 1)) *
        levelDots,
    ),
  )

  return (
    <article className="ms-training-card ms-training-card--stitch">
      <div className="ms-training-card-icon" aria-hidden="true">
        {program.emoji}
      </div>
      <div className="ms-training-card-body">
        <h2 className="ms-training-card-title">{program.title}</h2>
        <div className="ms-training-dots" aria-hidden="true">
          {Array.from({ length: levelDots }, (_, index) => (
            <span
              key={index}
              className={`ms-training-dot${index < filledDots ? ' on' : ''}`}
            />
          ))}
        </div>
        <p className="st-label-sm">
          {program.progress.completed
            ? 'Complete'
            : `${program.progress.lessonsCompleted} of ${program.progress.lessonsTotal} lessons`}
        </p>
      </div>
      <button
        type="button"
        className="ms-training-card-play tap-target"
        aria-label={`Open ${program.title}`}
        onClick={() => onOpenTrainingProgram(program.id)}
      >
        <i className="ti ti-player-play-filled" aria-hidden="true" />
      </button>
    </article>
  )
}
