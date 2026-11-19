import type { L } from "../i18n";
import { QUESTION_MAP } from "../data/quiz";
import { SITUATION_MAP } from "../data/situations";
import type { Option } from "../data/types";
import type { Answers, Traits } from "./scoring";

export type Decode = {
  situationId: string;
  meaning?: Option;
  want?: Option;
  action?: { do: L; send: L };
  warning?: L;
  /** partner's own words, if they added a note */
  note?: string;
  /** partner hasn't answered this one yet */
  missing: boolean;
};

const CHASE_WANTS = new Set(["space", "time", "leave", "no_double", "no_guilt", "check_once", "relax", "later", "not_personal", "believe"]);
const CLOSE_WANTS = new Set(["ask", "ask_again", "talk", "close", "hug", "hold", "reassure", "call", "text_me", "listen", "come_over", "sit"]);

export function decode(situationId: string, partnerAnswers: Answers, myTraits: Traits | null, partnerNote?: string): Decode {
  const s = SITUATION_MAP[situationId];
  const mq = QUESTION_MAP[s.meaningQ];
  const wq = QUESTION_MAP[s.wantQ];
  const meaning = mq.options?.find((o) => o.id === partnerAnswers[s.meaningQ]);
  const want = wq.options?.find((o) => o.id === partnerAnswers[s.wantQ]);
  const action = want ? s.actions[want.id] : undefined;

  let warning: L | undefined;
  if (want && myTraits) {
    if (CHASE_WANTS.has(want.id) && (myTraits.pursue > 0.25 || myTraits.anxious > 0.3 || myTraits.contact > 0.4)) {
      warning = {
        en: "Heads up: your instinct here is to chase. {name} needs the opposite — hold back a little.",
        ar: "انتبه: غريزتك هون إنك {تلحق|تلحقي}. {name} [بيحتاج|بتحتاج] العكس، {خفّف|خفّفي} شوي.",
      };
    } else if (CLOSE_WANTS.has(want.id) && (myTraits.withdraw > 0.25 || myTraits.avoidant > 0.3 || myTraits.space > 0.4)) {
      warning = {
        en: "Heads up: your instinct is to wait it out. {name} wants you to come closer.",
        ar: "انتبه: غريزتك إنك {تستنى|تستني} لتمرق. {name} [بدو|بدها] ياك {تقرب|تقربي}.",
      };
    } else if (myTraits.heat > 0.3 && ["after_fight", "jealous", "past"].includes(situationId)) {
      warning = {
        en: "Heads up: keep your voice soft here. Heat makes this one worse.",
        ar: "انتبه: {خلّي|خلّي} صوتك هادي هون. العصبية بتخربها أكثر.",
      };
    }
  }
  return { situationId, meaning, want, action, warning, note: partnerNote, missing: !meaning && !want };
}
