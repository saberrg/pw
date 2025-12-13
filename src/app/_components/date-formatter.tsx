import { parseISO, format, isValid } from "date-fns";

type Props = {
  dateString?: string;
};

const DateFormatter = ({ dateString }: Props) => {
  if (!dateString) {
    return <time>No date available</time>;
  }

  const date = parseISO(dateString);
  
  if (!isValid(date)) {
    return <time>Invalid date</time>;
  }

  return <time dateTime={dateString}>{format(date, "LLLL	d, yyyy")}</time>;
};

export default DateFormatter;
