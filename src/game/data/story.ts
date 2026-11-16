import source from './chapter0.json';
import { parseStoryCatalog, runtimeStory } from '../systems/StoryCatalog';

// Reserved IDs in Tiled: bedroom.bed / desk / laptop / alarm / bookshelf / photo / door.
// Validation runs for drafts too; only approved content is exposed to gameplay.
export const story = runtimeStory(parseStoryCatalog(source));
export const { dialogues, quests, memories } = story;
