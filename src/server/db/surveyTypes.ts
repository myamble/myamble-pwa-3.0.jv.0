// export type Survey = {
//   questions: Question[];
// };

// // Base type for all questions
// export type BaseQuestion = {
//   id: string;
//   type: QuestionTypeStr;
//   heading: string;
//   body: string;
//   required: boolean;
// };

// export type HasID = {
//   id: string;
// };

// // Specific question types
// export type SingleSelectQuestion = BaseQuestion & {
//   type: QuestionTypeStr.single_select;
//   singleSelectOptions: HasID &
//     {
//       icon: string;
//       label: string;
//     }[];
//   defaultSingleSelectOption: HasID;
// };

// export type MultiSelectQuestion = BaseQuestion & {
//   type: QuestionTypeStr.multi_select;
//   multiSelectOptions: HasID &
//     {
//       icon: string;
//       label: string;
//     }[];
//   defaultMultiSelectOptions: HasID[];
// };

// export type NumberQuestion = BaseQuestion & {
//   type: QuestionTypeStr.number;
//   numberMin: number;
//   numberMax: number;
//   numberStep: number;
//   defaultNumber: number;
// };

// export type TimeQuestion = BaseQuestion & {
//   type: QuestionTypeStr.time;
//   timeMin: string;
//   timeMax: string;
//   defaultTime: string;
// };

// export type DateQuestion = BaseQuestion & {
//   type: QuestionTypeStr.date;
//   includeTime: boolean;
//   dateMin: string | "past" | "future";
//   dateMax: string | "past" | "future";
//   defaultDate: string;
// };

// export type YesNoQuestion = BaseQuestion & {
//   type: QuestionTypeStr.yes_no;
//   defaultYesNo: "yes" | "no";
// };

// export type RatingQuestion = BaseQuestion & {
//   type: QuestionTypeStr.rating;
//   defaultRating: number;
// };

// export type LongTextQuestion = BaseQuestion & {
//   type: QuestionTypeStr.long_text;
//   defaultLongText: string;
// };

// export type ShortTextQuestion = BaseQuestion & {
//   type: QuestionTypeStr.short_text;
//   defaultShortText: string;
// };

// export type NumberRangeQuestion = BaseQuestion & {
//   type: QuestionTypeStr.number_range;
//   numberRangeMin: number;
//   numberRangeMax: number;
//   numberRangeStep: number;
//   numberRangeMinSep: number;
//   numberRangeMaxSep: number;
//   defaultNumberRange: number;
// };

// export type TimeRangeQuestion = BaseQuestion & {
//   type: QuestionTypeStr.time_range;
//   timeRangeMin: string;
//   timeRangeMax: string;
//   timeRangeMinSep: string;
//   timeRangeMaxSep: string;
//   defaultTimeRange: string;
// };

// export type DateRangeQuestion = BaseQuestion & {
//   type: QuestionTypeStr.date_range;
//   includeTime: boolean;
//   dateRangeMin: string | "past" | "future";
//   dateRangeMax: string | "past" | "future";
//   dateRangeMinSep: string | "past" | "future";
//   dateRangeMaxSep: string | "past" | "future";
//   defaultDateRange: string;
// };

// // Union type for any question
// export type AnyQuestion =
//   | SingleSelectQuestion
//   | MultiSelectQuestion
//   | NumberQuestion
//   | DateQuestion
//   | YesNoQuestion
//   | RatingQuestion
//   | LongTextQuestion
//   | ShortTextQuestion
//   | NumberRangeQuestion
//   | DateRangeQuestion;

// export enum QuestionTypeStr {
//   single_select,
//   multi_select,
//   number,
//   time,
//   date,
//   yes_no,
//   rating,
//   long_text,
//   short_text,
//   number_range,
//   time_range,
//   date_range,
// }

// export const QuestionTypes = [
//   {
//     id: QuestionTypeStr.single_select,
//     name: "Single Select",
//     icon: "single_select",
//   },
//   {
//     id: QuestionTypeStr.multi_select,
//     name: "Multi Select",
//     icon: "multi_select",
//   },
//   {
//     id: QuestionTypeStr.number,
//     name: "Number",
//     icon: "number",
//   },
//   {
//     id: QuestionTypeStr.date,
//     name: "Date",
//     icon: "date",
//   },
//   {
//     id: QuestionTypeStr.yes_no,
//     name: "Yes/No",
//     icon: "yes_no",
//   },
//   {
//     id: QuestionTypeStr.rating,
//     name: "Rating",
//     icon: "rating",
//   },
//   {
//     id: QuestionTypeStr.long_text,
//     name: "Long Text",
//     icon: "long_text",
//   },
//   {
//     id: QuestionTypeStr.short_text,
//     name: "Short Text",
//     icon: "short_text",
//   },
//   {
//     id: QuestionTypeStr.number_range,
//     name: "Number Range",
//     icon: "number_range",
//   },
//   {
//     id: QuestionTypeStr.date_range,
//     name: "Date Range",
//     icon: "date_range",
//   },
// ];
