import Input from "../../components/ui/Input";

export function InputField({
  title,
  description = "",
  value = "",
  onChange = () => {},
  placeholder = "",
}: {
  title: string;
  description?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl p-4 transition focus-within:bg-white/10 xl:w-2/3 2xl:w-1/2">
      <div className="flex flex-col">
        <span>{title}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
