// Figma Components › Status Badge / 진행 중. 프로젝트 endDate가 null일 때.
export function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full bg-success-light py-[3px] pr-2.5 pl-2 text-label-m text-success">
      <span aria-hidden className="size-[7px] rounded-full bg-success" />
      진행 중
    </span>
  );
}
