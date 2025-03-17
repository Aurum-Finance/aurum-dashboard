interface CardProps {
  title: string;
  value: string;
  description?: string;
  styleClass?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export default function Card({
  title,
  value,
  description,
  styleClass,
   valueColor,
}: CardProps) {
  return (
    <div className="border-x-2 border-t-2  border-dashed border-[#80002030] rounded-[2.5rem] pt-[2.4px] px-[2.4px]">
      <div className="border-x-2 border-t-2  border-dashed border-[#8000208C] rounded-[2.2rem] pt-[2px] px-[2px]">
        <div className="border-x-2 border-t-2 border-dashed border-[#800020] rounded-[2.1rem] pt-[2px] px-[2px]">
          <div
            className={`relative h-[176px] overflow-hidden rounded-[2rem] p-6
      ${
        styleClass ||
        "bg-gradient-to-br from-[#D9D9D9B2] to-[#89132E] border-[0.5px] border-[#800020] shadow-inner shadow-[#800020]"
      }`}
          >
            {/* Card content */}
            <div className="relative z-10 flex flex-col gap-10">
              <h2 className="text-xl font-semibold text-rose-900">{title}</h2>
              <div>
                <p className={`text-4xl font-bold tracking-tight ${valueColor}`}>
                  {value}
                </p>
                {description && (
                  <p className="-mt-1 text-sm text-[#328738]">{description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
