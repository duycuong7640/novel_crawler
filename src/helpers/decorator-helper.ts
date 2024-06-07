import { RESPONSE_MESSAGE } from '../constants/response-message';

export function getVariableName<TResult>(getVar: () => TResult): string {
  const m = /\(\)=>(.*)/.exec(
    getVar.toString().replace(/(\r\n|\n|\r|\s)/gm, '')
  );

  if (!m) {
    throw new Error(
      RESPONSE_MESSAGE.exceptionMessage.the_function_does_not_contain_a_statement_matching_return_variable_name
    );
  }

  const fullMemberName = m[1];

  const memberParts = fullMemberName.split('.');

  return memberParts[memberParts.length - 1];
}
