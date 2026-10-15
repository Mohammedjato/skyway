import { AIRPORTS } from "@/lib/airports";

export default function AirportSelect(props: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <label className="field" htmlFor={props.id}>
      <span>{props.label}</span>
      <select id={props.id} value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {AIRPORTS.map((a) => (
          <option key={a.code} value={a.code}>
            {a.city} ({a.code}) · {a.country}
          </option>
        ))}
      </select>
    </label>
  );
}
