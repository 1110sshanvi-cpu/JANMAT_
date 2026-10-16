const $=id=>document.getElementById(id);
const screens=['homeScreen','howScreen','exploreScreen','issueScreen','billScreen','debateScreen','resultScreen','quizScreen'];
let currentVote='for', role='member', quizIndex=0, quizAnswers={}, quizSubmitted=false;
const roleInfo={
 member:{name:'Member of Parliament',short:'MP',desc:'Consider the public interest and decide how you will vote.'},
 treasury:{name:'Treasury Bench MP',short:'TB',desc:'Explain why the proposal could help, and consider how it can be implemented.'},
 opposition:{name:'Opposition MP',short:'OP',desc:'Scrutinise the proposal, question its costs and suggest improvements.'},
 speaker:{name:'Speaker',short:'SP',desc:'Guide the discussion fairly and help the House follow the session rules.'}
};
const questions=[
 {q:'What is a Bill?',a:['A proposal for a law or a change to a law','A law that has automatically taken effect','A court judgement'],correct:0,why:'A Bill is a proposal. It must go through the relevant law-making process before it becomes an Act.'},
 {q:'What is one role of the Opposition in Parliament?',a:['To stop every Bill automatically','To scrutinise proposals and question the government','To appoint the President'],correct:1,why:'The Opposition examines government proposals, raises concerns and holds the government to account.'},
 {q:'For an ordinary Bill, what generally happens after both Houses pass it?',a:['It automatically becomes law immediately','It goes to the President for assent','It is sent to every school for a vote'],correct:1,why:'An ordinary Bill generally requires Presidential assent after being passed by both Houses.'}
];
function show(id){screens.forEach(s=>$(s).classList.toggle('active',s===id));window.scrollTo({top:0,behavior:'smooth'});}
function goHome(){show('homeScreen')}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function getAmendments(){return [...document.querySelectorAll('input[name="amendment"]:checked')].map(x=>x.value)}
function updateCount(){$('selectedCount').textContent=getAmendments().length}
function setRole(val){role=val;const r=roleInfo[role];$('roleAvatar').textContent=r.short;$('roleName').textContent=r.name;$('roleDescription').textContent=r.desc}
function vote(val){
 currentVote=val;
 const amendments=getAmendments();
 // Deliberately illustrative, fixed classroom tally: not a real or predictive parliamentary vote.
 let yes=56+amendments.length*3, no=44-amendments.length*3;
 if(val==='against'){yes-=8;no+=8} else if(val==='abstain'){yes-=3;no+=1}
 yes=Math.max(10,Math.min(90,yes));no=100-yes;
 $('voteResult').textContent=val==='for'?'IN FAVOUR':val==='against'?'AGAINST':'ABSTAINED';
 $('resultHeading').textContent=val==='for'?'You supported the Bill.':val==='against'?'You opposed the Bill.':'You abstained.';
 $('resultLead').textContent=val==='for'?'You chose to support the proposed safety measures.':val==='against'?'You chose not to support the proposed safety measures.':'You chose not to vote either way in this mock session.';
 $('forNum').textContent=yes;$('againstNum').textContent=no;
 $('forBar').style.width=yes+'%';$('againstBar').style.width=no+'%';
 const passed=yes>no;
 $('outcomeText').textContent=passed?'In this illustrative classroom tally, the Bill passes the mock vote.':'In this illustrative classroom tally, the Bill does not pass the mock vote.';
 $('resultSeal').textContent=passed?'✓':'↺';
 show('resultScreen');
}
function renderQuiz(){
 const q=questions[quizIndex];quizSubmitted=false;
 $('quizProgress').textContent=`QUESTION ${quizIndex+1} OF ${questions.length}`;
 $('quizContainer').innerHTML=`<article class="quiz-question"><h3>${quizIndex+1}. ${q.q}</h3>${q.a.map((a,i)=>`<label class="quiz-option"><input type="radio" name="q${quizIndex}" value="${i}" ${quizAnswers[quizIndex]===i?'checked':''}><span>${a}</span></label>`).join('')}</article>`;
 $('quizFeedback').hidden=true;$('quizNextBtn').disabled=quizAnswers[quizIndex]===undefined;
 $('quizNextBtn').textContent=quizIndex===questions.length-1?'Finish quiz →':'Check answer →';
 $('quizContainer').querySelectorAll('input').forEach(inp=>inp.addEventListener('change',()=>{quizAnswers[quizIndex]=Number(inp.value);$('quizNextBtn').disabled=false;}));
}
function checkQuiz(){
 const q=questions[quizIndex];const ans=quizAnswers[quizIndex];
 if(ans===undefined)return;
 const feedback=$('quizFeedback');feedback.hidden=false;
 feedback.textContent=(ans===q.correct?'Correct! ':'Not quite. ')+q.why;
 document.querySelectorAll(`input[name="q${quizIndex}"]`).forEach(inp=>{const label=inp.closest('label');if(Number(inp.value)===q.correct)label.classList.add('correct');if(Number(inp.value)===ans&&ans!==q.correct)label.classList.add('incorrect');inp.disabled=true;});
 quizSubmitted=true;$('quizNextBtn').textContent=quizIndex===questions.length-1?'See your score →':'Next question →';
 $('quizNextBtn').onclick=nextQuiz;
}
function nextQuiz(){
 if(!quizSubmitted){checkQuiz();return}
 if(quizIndex<questions.length-1){quizIndex++;renderQuiz();$('quizNextBtn').onclick=checkQuiz}
 else{
  const score=questions.filter((q,i)=>quizAnswers[i]===q.correct).length;
  $('quizContainer').innerHTML=`<article class="quiz-question"><span class="mini-label">YOUR RESULT</span><h3>You scored ${score} out of ${questions.length}.</h3><p class="hint">${score===3?'Excellent work — you understand the basics of this simulation.':score===2?'Good job! Review the explanations to strengthen your civics knowledge.':'Keep exploring. Replay JANMAT and try the questions again.'}</p></article>`;
  $('quizProgress').textContent='QUIZ COMPLETE';$('quizNextBtn').disabled=true;$('quizFeedback').hidden=true;
 }
}
function startQuiz(){quizIndex=0;quizAnswers={};quizSubmitted=false;renderQuiz();$('quizNextBtn').onclick=checkQuiz;show('quizScreen')}
function restart(){currentVote='for';role='member';setRole(role);document.querySelectorAll('input[name="amendment"]').forEach((x,i)=>x.checked=i<2);updateCount();$('roleSelect').value='member';show('homeScreen');toast('Session restarted. Ready when you are!')}
$('startBtn').onclick=()=>show('issueScreen');$('howBtn').onclick=()=>show('howScreen');$('howStartBtn').onclick=()=>show('issueScreen');$('exploreBtn').onclick=()=>show('exploreScreen');$('exploreStartBtn').onclick=()=>show('issueScreen');
document.querySelectorAll('[data-topic]').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('[data-topic]').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-selected',b===btn?'true':'false')});document.querySelectorAll('.explore-topic').forEach(panel=>panel.classList.toggle('active',panel.id===btn.dataset.topic));});
document.querySelectorAll('[data-back="home"]').forEach(b=>b.onclick=goHome);
$('issueNextBtn').onclick=()=>{setRole($('roleSelect').value);show('billScreen')};
document.querySelectorAll('input[name="amendment"]').forEach(x=>x.addEventListener('change',updateCount));
$('debateBtn').onclick=()=>{if(!getAmendments().length){toast('Select at least one measure to discuss.');return}show('debateScreen')};
document.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>vote(b.dataset.vote));
$('changeRoleBtn').onclick=()=>{show('issueScreen');toast('Change your role, then review the Bill again.')};
$('quizBtn').onclick=startQuiz;$('quizRestartBtn').onclick=startQuiz;$('againBtn').onclick=restart;$('resetBtn').onclick=restart;$('finishBtn').onclick=goHome;
$('quizNextBtn').onclick=checkQuiz;
updateCount();setRole(role);
