import { NewsObject, PatchNote, TipObject } from "./model";

export const trendingNews: NewsObject[] = [
   {
      title: "Welcome to the Rainy Days beta test!",
      text: [
         "I am happy to have you here! If you have any feedback about the game, please let me know!",
         "Until then, have fun, and color those cars!"
      ]
   }
];

export const patchNotes: PatchNote[] = [
   {
      version: "Beta 1",
      date: "now",
      content: [
         "Initial release"
      ]
   }
];

export const gameTips: { version: string, tips: TipObject[] }[] = [
   {
      version: "Beta 1",
      tips: [
         {
            name: "Tip 1",
            description: "This is a tip"
         },
         {
            name: "Tip 2",
            description: "This is another tip"
         }
      ]
   }
];
