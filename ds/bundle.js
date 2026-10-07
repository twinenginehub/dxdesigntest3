/* @ds-bundle: {"format":4,"namespace":"DoxaDS","components":[{"name":"Button"},{"name":"IconButton"},{"name":"Input"},{"name":"Select"},{"name":"Checkbox"},{"name":"Radio"},{"name":"Switch"},{"name":"ValidationSummary"},{"name":"ChoiceCard"},{"name":"AddAnotherLink"},{"name":"Badge"},{"name":"Tag"},{"name":"Chip"},{"name":"Toast"},{"name":"Tooltip"},{"name":"Spinner"},{"name":"Skeleton"},{"name":"EmptyState"},{"name":"ErrorState"},{"name":"Card"},{"name":"Tabs"},{"name":"Dialog"},{"name":"Breadcrumb"},{"name":"Pagination"},{"name":"SkipLink"},{"name":"Hero"},{"name":"Nav"},{"name":"Footer"},{"name":"ComparisonTable"},{"name":"PricingTable"},{"name":"StepList"},{"name":"TestimonialCard"},{"name":"BadgeStrip"},{"name":"Stat"},{"name":"RoleCard"},{"name":"FAQAccordion"},{"name":"EventCard"},{"name":"SpeakerCard"}]} */
(function(){
"use strict";
var React=window.React;
var useState=React.useState,useEffect=React.useEffect,useRef=React.useRef,useLayoutEffect=React.useLayoutEffect,useMemo=React.useMemo;

/* ---------------------------------------------------------------------------
 * Icon() — a small set of inline-SVG stand-ins for the handful of Tabler icons
 * a few components reference by filename (chevron, search, menu, star, check/x,
 * and four social glyphs). The full ~1,000-icon library this system originally
 * drew from hasn't been migrated into this artifact yet (see the README's note
 * at the top) — these are deliberately generic placeholders, not the brand's
 * actual icon set, and should be swapped for the real SVGs once that library
 * is brought over.
 * ------------------------------------------------------------------------- */
var ICON_PATHS={
  'chevron-down':'M6 9l6 6 6-6',
  'chevron-right':'M9 6l6 6-6 6',
  'search':'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  'menu':'M4 6h16M4 12h16M4 18h16',
  'x':'M6 6l12 12M18 6L6 18',
  'check':'M5 12l5 5L20 7',
  'star':'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.6L12 17.4 6.2 20.6l1.1-6.6-4.8-4.6 6.6-.9z',
  'linkedin':'M4 4h16v16H4zM8 10v7M8 7.2h.01M12 17v-4.5c0-1.4 1-2.5 2.3-2.5S16 11 16 12.5V17',
  'facebook':'M15 8h-2c-.6 0-1 .6-1 1.2V11h3l-.4 3H12v6h-3v-6H7v-3h2V9c0-2 1.4-4 4-4h2z',
  'instagram':'M4 4h16v16H4zM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM16.5 7.5h.01',
  'youtube':'M4 8.5c0-1.4 1-2.5 2.5-2.5h11c1.5 0 2.5 1.1 2.5 2.5v7c0 1.4-1 2.5-2.5 2.5h-11C5 18 4 16.9 4 15.5zM10 9.5l5 2.5-5 2.5z',
  'tiktok':'M14 4v9.5a2.5 2.5 0 1 1-2-2.45M14 4c.3 2 1.8 3.5 4 3.7'
};
function Icon(name,props){
props=props||{};
var d=ICON_PATHS[name]||ICON_PATHS.check;
return React.createElement('svg',{viewBox:'0 0 24 24',width:props.width||16,height:props.height||16,fill:'none',stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round',style:props.style,'aria-hidden':'true'},
React.createElement('path',{d:d})
);
}
/* FilledStar — a solid-fill star (Icon() is stroke-only/outline, which reads as "unfilled" for every state). Used for the filled positions in a star rating; the outline Icon('star') is used for the unfilled remainder. */
function FilledStar(props){
var p=props||{};
return React.createElement('svg',{viewBox:'0 0 24 24',width:p.width||16,height:p.height||16,fill:'currentColor',stroke:'none',style:p.style,'aria-hidden':'true'},
React.createElement('path',{d:ICON_PATHS.star})
);
}
/* MarkBadge — the system's status-mark convention: a filled circle carrying a bold checkmark, x, or tilde, never a bare glyph. kind: 'check'|'x'|'tilde'. Default fill is the brand gradient (checkmark) / magenta (x) / gold (tilde), mark in white; pass {onGradient:true} for a checkmark badge sitting on top of an already-gradient-shaded surface, which switches its mark to navy for contrast (x and tilde badges stay white-on-solid regardless, since their backgrounds are already solid colors). Used by ComparisonTable's yes/no/partial cells and anywhere else a check/x/tilde status mark appears. */
function MarkBadge(kind,props){
var p=props||{};
var size=p.size||20;
var bg=kind==='x'?'var(--magenta)':kind==='tilde'?'var(--gold)':'var(--brand-gradient)';
var markColor=(kind==='check'&&p.onGradient)?'var(--doxa-navy)':'#fff';
var glyph;
if(kind==='check'){
glyph=React.createElement('svg',{viewBox:'0 0 10 8',width:size*0.5,height:size*0.4,fill:'none','aria-hidden':'true'},React.createElement('path',{d:'M1 4l2.5 2.5L9 1',stroke:markColor,strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'}));
}else if(kind==='x'){
glyph=React.createElement('svg',{viewBox:'0 0 10 10',width:size*0.45,height:size*0.45,fill:'none','aria-hidden':'true'},React.createElement('path',{d:'M1 1l8 8M9 1l-8 8',stroke:markColor,strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'}));
}else{
glyph=React.createElement('span',{style:{color:markColor,fontWeight:800,fontSize:size*0.55,lineHeight:1}},'~');
}
return React.createElement('span',{style:Object.assign({width:size,height:size,borderRadius:'50%',background:bg,display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0},p.style),'aria-hidden':'true'},glyph);
}
/* BrandChevron — the actual DOXA brand-mark chevron (solid fill, from the X-mark/logo), heavier than the thin Tabler-style Icon('chevron-right') stroke glyph. Use wherever a chevron should read as the brand mark rather than a generic UI affordance. */
function BrandChevron(props){
var p=props||{};
return React.createElement('svg',{viewBox:'0 0 25.22 37.46',style:Object.assign({width:p.width||8,height:p.height||12,fill:'currentColor',flexShrink:0},p.style),'aria-hidden':'true'},
React.createElement('path',{d:'M12.42,0s-.09,0-.14,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,36.98c-.05.08-.21.35-.26.43,0,0,.86.02,1.11.02,1.23,0,2.45,0,3.68,0,2.31,0,4.61,0,6.92.03h.08c.95-.01,1.41-.51,1.86-1.24,1.66-2.68,5.8-9.05,6.51-10.12l5.06-8.29-5.06-7.71c-.39-.54-.63-.85-.84-1.19-1.62-2.57-3.26-5.13-4.84-7.72-.49-.81-1.08-1.2-2-1.21h-.05Z'})
);
}

/* ============================= forms ==================================== */

var baseBtn={fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body)',border:'none',borderRadius:'var(--radius-md)',cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,position:'relative'};
var btnSizes={sm:{padding:'8px 18px',fontSize:'var(--text-body-sm)'},md:{padding:'12px 24px',fontSize:'var(--text-body)'},lg:{padding:'16px 32px',fontSize:'var(--text-body-lg)'}};
function Button(props){
props=props||{};
var variant=props.variant||'primary',size=props.size||'md',tone=props.tone||'light',disabled=!!props.disabled,children=props.children,onClick=props.onClick,type=props.type||'button',styleOverride=props.style,className=props.className;
var style=Object.assign({},baseBtn,btnSizes[size]||btnSizes.md,{opacity:disabled?0.45:1,cursor:disabled?'not-allowed':'pointer'},styleOverride);
var cls=['ds-btn','ds-btn-'+variant,tone==='dark'?'on-dark':'',className].filter(Boolean).join(' ');
return React.createElement('button',{type:type,disabled:disabled,onClick:onClick,style:style,className:cls},variant==='accent'?React.createElement('span',{style:{position:'relative'}},children):children);
}

function IconButton(props){
props=props||{};
var icon=props.icon!==undefined?props.icon:'›',label=props.label,variant=props.variant||'ghost',size=props.size||36,onClick=props.onClick;
var style={width:size,height:size,borderRadius:'50%',border:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:size*0.5};
return React.createElement('button',{'aria-label':label,title:label,onClick:onClick,style:style,className:'ds-btn ds-iconbtn-'+variant},icon);
}

var __inputUid=0;
function Input(props){
props=props||{};
var label=props.label,placeholder=props.placeholder,type=props.type||'text',error=props.error,disabled=!!props.disabled,value=props.value,onChange=props.onChange,tone=props.tone||'light';
var id=useMemo(function(){return 'ds-input-'+(++__inputUid);},[]);
var errId=id+'-error';
var boxStyle={fontFamily:'var(--font-body)',fontSize:'var(--text-body)',padding:'12px 14px',borderRadius:'var(--radius-md)',border:'1.5px solid '+(error?'var(--state-error)':'var(--border-subtle)'),color:'var(--text-primary)',background:disabled?'var(--surface-muted)':'var(--surface-card)',outline:'none',width:'100%',boxSizing:'border-box'};
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,fontFamily:'var(--font-body)'}},
label&&React.createElement('label',{htmlFor:id,style:{fontSize:'var(--text-body-sm)',fontWeight:600,color:tone==='dark'?'var(--text-inverse)':'var(--text-primary)'}},label),
React.createElement('input',{id:id,type:type,placeholder:placeholder,disabled:disabled,value:value,onChange:onChange,style:boxStyle,'aria-invalid':error?'true':undefined,'aria-describedby':error?errId:undefined}),
error&&React.createElement('div',{id:errId,role:'alert',style:{fontSize:'var(--text-caption)',color:'var(--state-error)'}},error)
);
}

function Select(props){
props=props||{};
var label=props.label,options=props.options||[],value=props.value,onChange=props.onChange,disabled=!!props.disabled,tone=props.tone||'light';
var boxStyle={fontFamily:'var(--font-body)',fontSize:'var(--text-body)',padding:'12px 32px 12px 14px',borderRadius:'var(--radius-md)',border:'1.5px solid var(--border-subtle)',color:'var(--text-primary)',background:disabled?'var(--surface-muted)':'var(--surface-card)',width:'100%',boxSizing:'border-box'};
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:6,fontFamily:'var(--font-body)'}},
label&&React.createElement('label',{style:{fontSize:'var(--text-body-sm)',fontWeight:600,color:tone==='dark'?'var(--text-inverse)':'var(--text-primary)'}},label),
React.createElement('select',{value:value,onChange:onChange,disabled:disabled,style:boxStyle},options.map(function(o,i){return React.createElement('option',{key:i,value:o},o);}))
);
}

function Checkbox(props){
props=props||{};
var label=props.label,checked=!!props.checked,onChange=props.onChange,disabled=!!props.disabled;
var box={width:20,height:20,borderRadius:'var(--radius-sm)',border:'1.5px solid '+(checked?'var(--doxa-navy)':'var(--border-strong)'),background:checked?'var(--doxa-navy)':'transparent',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0};
return React.createElement('label',{style:{display:'inline-flex',alignItems:'center',gap:10,fontFamily:'var(--font-body)',fontSize:'var(--text-body)',color:'var(--text-primary)',opacity:disabled?0.5:1,cursor:disabled?'not-allowed':'pointer'}},
React.createElement('input',{type:'checkbox',checked:checked,onChange:onChange,disabled:disabled}),
React.createElement('span',{style:box},checked&&React.createElement('span',{style:{color:'#fff',fontSize:13,lineHeight:1}},'✓')),
label
);
}

function Radio(props){
props=props||{};
var label=props.label,checked=!!props.checked,onChange=props.onChange,disabled=!!props.disabled;
var ring={width:20,height:20,borderRadius:'50%',border:'1.5px solid '+(checked?'var(--doxa-navy)':'var(--border-strong)'),display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0};
return React.createElement('label',{style:{display:'inline-flex',alignItems:'center',gap:10,fontFamily:'var(--font-body)',fontSize:'var(--text-body)',color:'var(--text-primary)',opacity:disabled?0.5:1,cursor:disabled?'not-allowed':'pointer'}},
React.createElement('input',{type:'radio',checked:checked,onChange:onChange,disabled:disabled}),
React.createElement('span',{style:ring},checked&&React.createElement('span',{style:{width:10,height:10,borderRadius:'50%',background:'var(--doxa-navy)'}})),
label
);
}

function Switch(props){
props=props||{};
var checked=!!props.checked,onChange=props.onChange,disabled=!!props.disabled,label=props.label;
var track={width:44,height:26,borderRadius:'var(--radius-md)',background:checked?'var(--doxa-green)':'var(--border-subtle)',position:'relative',transition:'background var(--duration-base) var(--ease-standard)',flexShrink:0};
var knob={position:'absolute',top:3,left:checked?21:3,width:20,height:20,borderRadius:'var(--radius-sm)',background:'#fff',boxShadow:'var(--shadow-sm)',transition:'left var(--duration-base) var(--ease-standard)'};
return React.createElement('label',{style:{display:'inline-flex',alignItems:'center',gap:10,fontFamily:'var(--font-body)',fontSize:'var(--text-body)',color:'var(--text-primary)',opacity:disabled?0.5:1,cursor:disabled?'not-allowed':'pointer'}},
React.createElement('input',{type:'checkbox',checked:checked,onChange:onChange,disabled:disabled}),
React.createElement('span',{style:track},React.createElement('span',{style:knob})),
label
);
}

function ValidationSummary(props){
props=props||{};
var errors=props.errors||[];
if(!errors.length)return null;
return React.createElement('div',{role:'alert',style:{border:'1.5px solid var(--state-error)',background:'color-mix(in srgb,var(--state-error) 8%,transparent)',borderRadius:'var(--radius-md)',padding:'14px 18px',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{fontWeight:700,fontSize:'var(--text-body-sm)',color:'var(--state-error)',marginBottom:6}},errors.length===1?'1 error needs your attention':errors.length+' errors need your attention'),
React.createElement('ul',{style:{margin:0,padding:'0 0 0 18px',display:'flex',flexDirection:'column',gap:2}},
errors.map(function(e,i){return React.createElement('li',{key:i,style:{fontSize:'var(--text-body-sm)'}},
React.createElement('a',{href:'#'+e.fieldId,style:{color:'var(--doxa-navy)',textDecoration:'underline'}},e.message)
);})
)
);
}

function ChoiceCard(props){
props=props||{};
var label=props.label,description=props.description,checked=!!props.checked,onChange=props.onChange;
return React.createElement('button',{type:'button',role:'radio','aria-checked':checked,onClick:function(){onChange&&onChange();},style:{display:'flex',width:'100%',alignItems:'flex-start',gap:12,padding:'var(--space-4)',borderRadius:'var(--radius-lg)',textAlign:'left',cursor:'pointer',fontFamily:'var(--font-body)',background:checked?'var(--surface-muted)':'transparent',border:checked?'2px solid var(--doxa-cyan-a11y)':'1px solid var(--border-subtle)',transition:'background var(--duration-base) var(--ease-standard),border-color var(--duration-base) var(--ease-standard)'}},
React.createElement('span',{'aria-hidden':'true',style:{marginTop:2,flexShrink:0,width:18,height:18,borderRadius:'50%',border:'2px solid '+(checked?'var(--doxa-cyan-a11y)':'var(--border-strong)'),background:checked?'var(--doxa-cyan-a11y)':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}},
checked&&React.createElement('span',{style:{width:6,height:6,borderRadius:'50%',background:'var(--doxa-white)'}})
),
React.createElement('span',null,
React.createElement('span',{style:{display:'block',fontWeight:600,color:'var(--text-primary)'}},label),
description&&React.createElement('span',{style:{display:'block',marginTop:2,fontSize:'var(--text-body-sm)',color:'var(--text-secondary)'}},description)
)
);
}

function AddAnotherLink(props){
props=props||{};
var label=props.label||'Add another',onClick=props.onClick;
return React.createElement('button',{type:'button',onClick:onClick,style:{alignSelf:'flex-start',border:'none',background:'none',padding:0,cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-body-sm)',fontWeight:600,color:'var(--text-primary)',textDecoration:'underline',textUnderlineOffset:3}},
'+ ',label
);
}

/* ============================= feedback ================================== */

var badgeColors={info:'var(--state-info)',success:'var(--state-success)',warning:'var(--state-warning)',error:'var(--state-error)',neutral:'var(--doxa-navy)'};
function Badge(props){
props=props||{};
var children=props.children,tone=props.tone||'neutral';
return React.createElement('span',{style:{display:'inline-flex',alignItems:'center',padding:'4px 12px',borderRadius:'var(--radius-md)',fontFamily:'var(--font-body)',fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'.02em',color:'#fff',background:badgeColors[tone]||badgeColors.neutral}},children);
}

function Tag(props){
props=props||{};
var children=props.children,active=!!props.active,tone=props.tone,onClick=props.onClick;
return React.createElement('button',{onClick:onClick,className:'ds-btn ds-tag'+(active?' active':'')+(tone?' ds-tag-'+tone:''),style:{borderRadius:'var(--radius-md)',padding:'6px 16px',fontFamily:'var(--font-body)',fontSize:'var(--text-body-sm)',border:'none',cursor:'pointer'}},children);
}

function Chip(props){
props=props||{};
var children=props.children,variant=props.variant||'outline',onRemove=props.onRemove;
return React.createElement('span',{className:'ds-btn ds-chip ds-chip-'+variant},
React.createElement('span',null,children),
onRemove&&React.createElement('button',{onClick:onRemove,'aria-label':'Remove',className:'ds-chip-remove'},'×')
);
}

var toastTones={info:'var(--state-info)',success:'var(--state-success)',warning:'var(--state-warning)',error:'var(--state-error)'};
function Toast(props){
props=props||{};
var tone=props.tone||'info',title=props.title,message=props.message;
return React.createElement('div',{style:{display:'flex',gap:12,alignItems:'flex-start',background:'var(--surface-card)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',padding:'14px 16px',maxWidth:340,fontFamily:'var(--font-body)',borderLeft:'4px solid '+(toastTones[tone]||toastTones.info),position:'relative',zIndex:'var(--z-toast)'}},
React.createElement('div',null,
title&&React.createElement('div',{style:{fontWeight:600,fontSize:'var(--text-body-sm)',color:'var(--text-primary)'}},title),
message&&React.createElement('div',{style:{fontSize:'var(--text-body-sm)',color:'var(--text-secondary)',marginTop:2}},message)
));
}

function Tooltip(props){
props=props||{};
var label=props.label,children=props.children;
var s=useState(false),show=s[0],setShow=s[1];
return React.createElement('span',{style:{position:'relative',display:'inline-block'},onMouseEnter:function(){setShow(true);},onMouseLeave:function(){setShow(false);}},
children,
show&&React.createElement('span',{style:{position:'absolute',bottom:'calc(100% + 8px)',left:'50%',transform:'translateX(-50%)',background:'var(--doxa-navy)',color:'#fff',padding:'6px 10px',borderRadius:'var(--radius-sm)',fontSize:'var(--text-caption)',fontFamily:'var(--font-body)',whiteSpace:'nowrap',boxShadow:'var(--shadow-md)',zIndex:'var(--z-tooltip)'}},label)
);
}

function Spinner(props){
props=props||{};
var size=props.size||24,tone=props.tone||'navy';
var color=tone==='white'?'var(--doxa-white)':'var(--doxa-navy)';
return React.createElement('span',{role:'status','aria-label':'Loading',style:{display:'inline-block',width:size,height:size,border:Math.max(2,size*0.12)+'px solid '+color,borderTopColor:'transparent',borderRadius:'50%',opacity:0.85,animation:'ds-spin .7s linear infinite'}});
}

function Skeleton(props){
props=props||{};
var width=props.width!==undefined?props.width:'100%',height=props.height!==undefined?props.height:16,radius=props.radius||'var(--radius-sm)';
return React.createElement('span',{'aria-hidden':'true',style:{display:'block',width:width,height:height,borderRadius:radius,background:'linear-gradient(90deg,var(--doxa-fog-100) 25%,var(--doxa-fog-50) 50%,var(--doxa-fog-100) 75%)',backgroundSize:'200% 100%',animation:'ds-skeleton 1.4s ease-in-out infinite'}});
}

function EmptyState(props){
props=props||{};
var title=props.title,body=props.body,action=props.action;
return React.createElement('div',{style:{textAlign:'center',padding:'var(--space-10) var(--space-6)',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h4)',fontWeight:700,color:'var(--text-primary)',marginBottom:8}},title),
body&&React.createElement('div',{style:{fontSize:'var(--text-body)',color:'var(--text-secondary)',maxWidth:400,margin:'0 auto'}},body),
action&&React.createElement('div',{style:{marginTop:'var(--space-5)'}},action)
);
}

function ErrorState(props){
props=props||{};
var title=props.title||'Something went wrong',body=props.body;
return React.createElement('div',{role:'alert',style:{textAlign:'center',padding:'var(--space-10) var(--space-6)',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h4)',fontWeight:700,color:'var(--text-primary)',marginBottom:8}},title),
body&&React.createElement('div',{style:{fontSize:'var(--text-body)',color:'var(--text-secondary)',maxWidth:400,margin:'0 auto'}},body)
);
}

/* ============================= surfaces ================================= */

function Card(props){
props=props||{};
var eyebrow=props.eyebrow,title=props.title,subtitle=props.subtitle,children=props.children,variant=props.variant||'light';
var dark=variant==='dark';
if(variant==='briefing'){
return React.createElement('div',{style:{position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',borderRadius:'var(--radius-lg)',border:'1px solid var(--border-subtle)',boxShadow:'var(--shadow-sm)',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{padding:'var(--space-6) var(--space-6) var(--space-5)',background:'var(--gradient-soft)'}},
title&&React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h3)',fontWeight:700,color:'var(--text-primary)',letterSpacing:'-0.02em',lineHeight:1.2}},title),
subtitle&&React.createElement('div',{style:{marginTop:4,fontSize:'var(--text-body)',color:'var(--text-secondary)'}},subtitle)
),
React.createElement('div',{style:{padding:'var(--space-6)',flex:1,background:'var(--surface-card)'}},
React.createElement('div',{style:{fontSize:'var(--text-body)',lineHeight:'var(--leading-relaxed)',color:'var(--text-secondary)'}},children)
)
);
}
return React.createElement('div',{style:{position:'relative',overflow:'hidden',background:dark?'var(--surface-dark)':'var(--surface-card)',color:dark?'var(--text-inverse)':'var(--text-primary)',borderRadius:'var(--radius-lg)',border:dark?'none':'1px solid var(--border-subtle)',boxShadow:'var(--shadow-sm)',padding:'var(--space-6)',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{position:'absolute',top:0,left:0,right:0,height:4,background:'var(--brand-gradient)'}}),
eyebrow&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-eyebrow)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',color:dark?'var(--cyan)':'var(--navy)',marginBottom:8}},React.createElement('svg',{viewBox:'0 0 25.22 37.46',style:{width:7,height:10,fill:'currentColor',flexShrink:0}},React.createElement('path',{d:'M12.42,0s-.09,0-.14,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,36.98c-.05.08-.21.35-.26.43,0,0,.86.02,1.11.02,1.23,0,2.45,0,3.68,0,2.31,0,4.61,0,6.92.03h.08c.95-.01,1.41-.51,1.86-1.24,1.66-2.68,5.8-9.05,6.51-10.12l5.06-8.29-5.06-7.71c-.39-.54-.63-.85-.84-1.19-1.62-2.57-3.26-5.13-4.84-7.72-.49-.81-1.08-1.2-2-1.21h-.05Z'})),eyebrow),
title&&React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h4)',fontWeight:700,marginBottom:8}},title),
React.createElement('div',{style:{fontSize:'var(--text-body)',lineHeight:'var(--leading-relaxed)',opacity:dark?0.85:1}},children)
);
}

function Tabs(props){
props=props||{};
var tabs=props.tabs||[],active=props.active,onChange=props.onChange,variant=props.variant||'underline',mode=props.mode||'light',panelId=props.panelId;
var s=useState(tabs[0]),internal=s[0],setInternal=s[1];
var current=active!==undefined?active:internal;
var set=function(t){onChange?onChange(t):setInternal(t);};
var btnRefs=useRef([]);
var filterIdRef=useRef('lg-filter-'+Math.random().toString(36).slice(2));
var s2=useState({left:0,width:0}),indicator=s2[0],setIndicator=s2[1];
var measure=function(){
var i=tabs.indexOf(current);
var el=btnRefs.current[i];
if(el)setIndicator({left:el.offsetLeft,width:el.offsetWidth});
};
useLayoutEffect(measure,[current,tabs.join('|')]);
useEffect(function(){
window.addEventListener('resize',measure);
return function(){window.removeEventListener('resize',measure);};
},[current]);
var onKeyDown=function(e,horizontal){
var nextKey=horizontal?'ArrowRight':'ArrowDown';
var prevKey=horizontal?'ArrowLeft':'ArrowUp';
var i=tabs.indexOf(current);
if(e.key===nextKey){i=(i+1)%tabs.length;btnRefs.current[i]&&btnRefs.current[i].focus();e.preventDefault();}
else if(e.key===prevKey){i=(i-1+tabs.length)%tabs.length;btnRefs.current[i]&&btnRefs.current[i].focus();e.preventDefault();}
else if(e.key==='Home'){btnRefs.current[0]&&btnRefs.current[0].focus();e.preventDefault();}
else if(e.key==='End'){btnRefs.current[tabs.length-1]&&btnRefs.current[tabs.length-1].focus();e.preventDefault();}
else if(e.key==='Enter'||e.key===' '){set(tabs[i]);e.preventDefault();}
};
var tabId=function(t){return 'ds-tab-'+t.replace(/\s+/g,'-').toLowerCase();};
if(variant==='segmented'){
var glass=mode==='dark';
var filterId=filterIdRef.current;
var glassTrackShadow=['inset 0 0 0 1px rgba(255,255,255,.10)','inset 1.8px 3px 0 -2px rgba(255,255,255,.90)','inset -2px -2px 0 -2px rgba(255,255,255,.80)','inset -3px -8px 1px -6px rgba(255,255,255,.60)','inset -.3px -1px 4px 0 rgba(0,0,0,.12)','inset -1.5px 2.5px 0 -2px rgba(0,0,0,.20)','inset 0 3px 4px -2px rgba(0,0,0,.20)','inset 2px -6.5px 1px -4px rgba(0,0,0,.10)','0 1px 5px 0 rgba(0,0,0,.10)','0 6px 16px 0 rgba(0,0,0,.08)'].join(',');
var glassPillShadow=['inset 0 0 0 1px rgba(255,255,255,.10)','inset 2px 1px 0 -1px rgba(255,255,255,.90)','inset -1.5px -1px 0 -1px rgba(255,255,255,.80)','inset -2px -6px 1px -5px rgba(255,255,255,.60)','inset -1px 2px 3px -1px rgba(0,0,0,.20)','inset 0 -4px 1px -2px rgba(0,0,0,.10)','0 3px 6px 0 rgba(0,0,0,.08)'].join(',');
var trackStyle=glass?{display:'inline-flex',position:'relative',padding:10,borderRadius:'8px 8px 0 0',fontFamily:'var(--font-body)',backgroundColor:'rgba(187,187,188,.12)',backdropFilter:'blur(1px) url(#'+filterId+') saturate(150%)',WebkitBackdropFilter:'blur(1px) saturate(150%)',boxShadow:glassTrackShadow,transition:'background-color 400ms cubic-bezier(1,0,.4,1),box-shadow 400ms cubic-bezier(1,0,.4,1)'}:{display:'inline-flex',gap:4,padding:4,background:'var(--doxa-fog-50)',borderRadius:'var(--radius-md)',fontFamily:'var(--font-body)',position:'relative'};
return React.createElement('div',{role:'tablist',style:trackStyle},
glass&&React.createElement('svg',{'aria-hidden':'true',style:{position:'absolute',width:0,height:0}},
React.createElement('defs',null,
React.createElement('filter',{id:filterId,x:'0',y:'0',width:'100%',height:'100%',filterUnits:'objectBoundingBox'},
React.createElement('feTurbulence',{type:'fractalNoise',baseFrequency:'0.003 0.007',numOctaves:'1',result:'turbulence'}),
React.createElement('feDisplacementMap',{in:'SourceGraphic',in2:'turbulence',scale:'200',xChannelSelector:'R',yChannelSelector:'G'})
)
)
),
React.createElement('div',{style:{position:'absolute',top:glass?6:4,left:indicator.left,width:indicator.width,height:glass?'calc(100% - 12px)':'calc(100% - 8px)',background:glass?'rgba(187,187,188,.36)':'var(--doxa-navy)',borderRadius:glass?999:'var(--radius-sm)',boxShadow:glass?glassPillShadow:'none',zIndex:glass?-1:0,transition:'left 400ms cubic-bezier(1,0,.4,1),width 400ms cubic-bezier(1,0,.4,1)'}}),
tabs.map(function(t,i){return React.createElement('button',{key:i,id:tabId(t),ref:function(el){btnRefs.current[i]=el;},role:'tab','aria-selected':t===current,tabIndex:t===current?0:-1,'aria-controls':panelId,onClick:function(){set(t);},onKeyDown:function(e){onKeyDown(e,true);},style:{position:'relative',zIndex:1,border:'none',display:'inline-flex',alignItems:'center',padding:glass?'12px 24px':'10px 20px',borderRadius:glass?0:'var(--radius-sm)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-body)',fontWeight:600,whiteSpace:'nowrap',transition:'color 300ms ease',background:'transparent',color:glass?(t===current?'#fff':'rgba(255,255,255,.75)'):(t===current?'var(--doxa-white)':'var(--text-secondary)')}},t);})
);
}
if(variant==='vertical'){
var h=useState(-1),hover=h[0],setHover=h[1];
return React.createElement('div',{role:'tablist','aria-orientation':'vertical',style:{display:'flex',flexDirection:'column',gap:'var(--space-1)',fontFamily:'var(--font-body)',minWidth:200}},
tabs.map(function(t,i){
var isActive=t===current;
var bg=isActive?'var(--brand-gradient)':(hover===i?'var(--doxa-navy)':'var(--doxa-cyan)');
return React.createElement('button',{key:i,id:tabId(t),ref:function(el){btnRefs.current[i]=el;},role:'tab','aria-selected':isActive,tabIndex:isActive?0:-1,'aria-controls':panelId,onClick:function(){set(t);},onKeyDown:function(e){onKeyDown(e,false);},onMouseEnter:function(){setHover(i);},onMouseLeave:function(){setHover(-1);},style:{textAlign:'left',border:'none',borderRadius:'var(--radius-md)',background:bg,padding:'14px 18px',cursor:'pointer',fontSize:'15px',fontWeight:600,textTransform:'uppercase',lineHeight:1.3,letterSpacing:'.02em',color:'var(--doxa-white)',transition:'background var(--duration-base) var(--ease-standard) var(--duration-fast)'}},t);
})
);
}
return React.createElement('div',{role:'tablist',style:{display:'flex',gap:'var(--space-6)',borderBottom:'1.5px solid var(--border-subtle)',fontFamily:'var(--font-body)',position:'relative'}},
React.createElement('div',{style:{position:'absolute',bottom:-1.5,left:indicator.left,width:indicator.width,height:2.5,background:'var(--doxa-cyan)',transition:'left var(--duration-base) var(--ease-standard),width var(--duration-base) var(--ease-standard)'}}),
tabs.map(function(t,i){return React.createElement('button',{key:i,id:tabId(t),ref:function(el){btnRefs.current[i]=el;},role:'tab','aria-selected':t===current,tabIndex:t===current?0:-1,'aria-controls':panelId,onClick:function(){set(t);},onKeyDown:function(e){onKeyDown(e,true);},style:{background:'none',border:'none',padding:'10px 2px',marginBottom:-2,cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-body)',fontWeight:600,color:t===current?'var(--doxa-navy)':'var(--text-muted)',transition:'color var(--duration-base) var(--ease-standard)'}},t);})
);
}

function Dialog(props){
props=props||{};
var open=props.open!==undefined?props.open:true,title=props.title,children=props.children,onClose=props.onClose;
var panelRef=useRef(null);
var triggerRef=useRef(null);
useEffect(function(){
if(!open)return;
triggerRef.current=document.activeElement;
panelRef.current&&panelRef.current.focus();
var onKey=function(e){if(e.key==='Escape')onClose&&onClose();};
document.addEventListener('keydown',onKey);
return function(){
document.removeEventListener('keydown',onKey);
triggerRef.current&&triggerRef.current.focus&&triggerRef.current.focus();
};
},[open]);
if(!open)return null;
return React.createElement('div',{style:{position:'absolute',inset:0,background:'rgba(5,37,56,.55)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-body)',zIndex:'var(--z-overlay)'},onClick:function(e){if(e.target===e.currentTarget)onClose&&onClose();}},
React.createElement('div',{ref:panelRef,role:'dialog','aria-modal':'true','aria-label':title,tabIndex:-1,style:{background:'var(--surface-card)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)',padding:'var(--space-8)',width:360,position:'relative',zIndex:'var(--z-modal)',outline:'none'}},
onClose&&React.createElement('button',{onClick:onClose,'aria-label':'Close dialog',style:{position:'absolute',top:16,right:16,border:'none',background:'none',fontSize:18,cursor:'pointer',color:'var(--text-muted)'}},'×'),
title&&React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h3)',fontWeight:700,color:'var(--text-primary)',marginBottom:12}},title),
React.createElement('div',{style:{fontSize:'var(--text-body)',color:'var(--text-secondary)',lineHeight:'var(--leading-relaxed)'}},children)
));
}

function Breadcrumb(props){
props=props||{};
var items=props.items||[],dark=props.tone==='dark';
var currentColor=dark?'var(--doxa-white)':'var(--text-primary)';
var linkColor=dark?'rgba(255,255,255,.7)':'var(--text-secondary)';
var sepColor=dark?'rgba(255,255,255,.4)':'var(--text-muted)';
return React.createElement('nav',{'aria-label':'Breadcrumb',style:{fontFamily:'var(--font-body)'}},
React.createElement('ol',{style:{display:'flex',alignItems:'center',gap:8,listStyle:'none',margin:0,padding:0,fontSize:'var(--text-body-sm)',flexWrap:'wrap'}},
items.map(function(it,i){
var last=i===items.length-1;
return React.createElement('li',{key:i,style:{display:'flex',alignItems:'center',gap:8}},
last?React.createElement('span',{'aria-current':'page',style:{color:currentColor,fontWeight:600}},it.label)
:React.createElement('a',{href:it.href||'#',style:{color:linkColor,textDecoration:'none',fontWeight:500}},it.label),
!last&&React.createElement('span',{'aria-hidden':'true',style:{color:sepColor,fontSize:12,fontWeight:700}},'›')
);
})
));
}

function paginationPageList(current,total){
if(total<=7)return Array.from({length:total},function(_,i){return i+1;});
var pages={};
[1,2,total-1,total,current-1,current,current+1].forEach(function(p){pages[p]=true;});
return Object.keys(pages).map(Number).filter(function(p){return p>=1&&p<=total;}).sort(function(a,b){return a-b;});
}
function Pagination(props){
props=props||{};
var page=props.page||1,totalPages=props.totalPages||1,onChange=props.onChange,variant=props.variant||'numbered';
if(variant==='load-more'){
if(page>=totalPages)return null;
return React.createElement('div',{style:{display:'flex',justifyContent:'center'}},
React.createElement('button',{className:'ds-btn ds-btn-secondary ds-load-more',style:{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body-sm)',padding:'10px 24px',borderRadius:'var(--radius-md)',cursor:'pointer'},onClick:function(){onChange&&onChange(page+1);}},'Load more')
);
}
var pages=paginationPageList(page,totalPages);
var items=[];
var prev=0;
pages.forEach(function(p){
if(p-prev>1)items.push('…'+p);
items.push(p);
prev=p;
});
var btnStyle=function(active){return {minWidth:32,height:32,padding:'0 6px',border:'none',borderRadius:'var(--radius-sm)',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'var(--text-body-sm)',fontWeight:active?700:500,color:active?'var(--doxa-white)':'var(--text-secondary)',background:active?undefined:'transparent'};};
return React.createElement('nav',{'aria-label':'Pagination',style:{display:'flex',alignItems:'center',gap:4,fontFamily:'var(--font-body)'}},
React.createElement('button',{className:'ds-btn ds-iconbtn-ghost','aria-label':'Previous page',disabled:page<=1,onClick:function(){onChange&&onChange(page-1);},style:{width:32,height:32,borderRadius:'50%',border:'none',cursor:page<=1?'not-allowed':'pointer',opacity:page<=1?0.4:1}},'‹'),
items.map(function(it,i){return typeof it==='string'
?React.createElement('span',{key:i,'aria-hidden':'true',style:{color:'var(--text-muted)',padding:'0 4px'}},'…')
:React.createElement('button',{key:i,'aria-current':it===page?'page':undefined,className:it===page?'ds-btn ds-page-active':undefined,onClick:function(){onChange&&onChange(it);},style:btnStyle(it===page)},it);
}),
React.createElement('button',{className:'ds-btn ds-iconbtn-ghost','aria-label':'Next page',disabled:page>=totalPages,onClick:function(){onChange&&onChange(page+1);},style:{width:32,height:32,borderRadius:'50%',border:'none',cursor:page>=totalPages?'not-allowed':'pointer',opacity:page>=totalPages?0.4:1}},'›')
);
}

function SkipLink(props){
props=props||{};
var href=props.href||'#main-content',children=props.children!==undefined?props.children:'Skip to content';
return React.createElement('a',{href:href,style:{position:'absolute',left:-9999,top:'auto',width:1,height:1,overflow:'hidden'},onFocus:function(e){e.target.style.cssText='position:fixed;left:16px;top:16px;width:auto;height:auto;overflow:visible;z-index:100;padding:10px 16px;border-radius:var(--radius-md);background:var(--doxa-navy);color:var(--doxa-white);font-family:var(--font-display);font-weight:600;font-size:var(--text-body-sm);text-decoration:none';},onBlur:function(e){e.target.style.cssText='position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden';}},children);
}

/* ============================= marketing ================================= */

function Hero(props){
props=props||{};
var variant=props.variant||'photo',layout=props.layout||'contained',eyebrow=props.eyebrow,headline=props.headline,body=props.body,children=props.children;
if(variant==='split'){
var media=props.media,mediaSide=props.mediaSide||'right',breadcrumb=props.breadcrumb;
var textPanel=React.createElement('div',{key:'text',style:{background:'var(--doxa-navy)',display:'flex',alignItems:'center',padding:'var(--space-16) var(--container-pad)',minWidth:0}},
React.createElement('div',{style:{maxWidth:620}},
breadcrumb&&React.createElement('div',{style:{marginBottom:'var(--space-4)'}},React.createElement(Breadcrumb,{items:breadcrumb,tone:'dark'})),
eyebrow&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-eyebrow)',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--doxa-cyan-a11y)',marginBottom:'var(--space-3)'}},eyebrow),
React.createElement('h1',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h1)',fontWeight:700,color:'var(--doxa-white)',margin:0,lineHeight:1.1}},headline),
body&&React.createElement('p',{style:{fontFamily:'var(--font-body)',fontSize:'var(--text-body-lg)',color:'rgba(255,255,255,.85)',marginTop:'var(--space-4)',lineHeight:1.6}},body),
children&&React.createElement('div',{style:{marginTop:'var(--space-6)',display:'flex',gap:'var(--space-3)',flexWrap:'wrap'}},children)
)
);
var mediaPanel=React.createElement('div',{key:'media',style:{background:'var(--doxa-navy)',overflow:'hidden'}},
media&&React.createElement('img',{src:media,alt:'',style:{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 40%',display:'block'}})
);
return React.createElement('div',{style:{display:'grid',gridTemplateColumns:mediaSide==='left'?'1fr 2fr':'2fr 1fr'}},
mediaSide==='left'?mediaPanel:textPanel,
mediaSide==='left'?textPanel:mediaPanel
);
}
var isPhoto=variant==='photo';
var full=layout==='full';
var wrap={position:'relative',borderRadius:full?0:'var(--radius-lg)',overflow:'hidden',padding:full?'var(--space-24) var(--container-pad) var(--space-20)':'var(--space-16) var(--space-10)',display:'flex',flexDirection:'column',gap:'var(--space-4)',minHeight:full?0:280,justifyContent:'center',backgroundImage:isPhoto?"url('/_blob/e65bbd7df1e2e26f55d49371583552f6')":'none',backgroundColor:isPhoto?'var(--doxa-navy-10)':'var(--doxa-navy)',backgroundSize:'cover',backgroundPosition:isPhoto?'center 25%':'center'};
var overlay={position:'absolute',inset:0,background:'linear-gradient(160deg,var(--doxa-cyan) 0%,var(--doxa-green) 100%)',mixBlendMode:'multiply'};
var content={position:'relative',maxWidth:full?620:560};
return React.createElement('div',{style:wrap},
isPhoto&&React.createElement('div',{style:overlay}),
React.createElement('div',{style:content},
eyebrow&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:6,fontSize:'var(--text-eyebrow)',fontWeight:600,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--doxa-white)',marginBottom:'var(--space-3)'}},
React.createElement('svg',{viewBox:'0 0 25.22 37.46',style:{width:7,height:10,fill:'currentColor',flexShrink:0}},
React.createElement('path',{d:'M12.42,0s-.09,0-.14,0H.87c3.92,6.27,7.96,12.01,11.76,17.94C8.5,24.29,4.42,30.57.26,36.98c-.05.08-.21.35-.26.43,0,0,.86.02,1.11.02,1.23,0,2.45,0,3.68,0,2.31,0,4.61,0,6.92.03h.08c.95-.01,1.41-.51,1.86-1.24,1.66-2.68,5.8-9.05,6.51-10.12l5.06-8.29-5.06-7.71c-.39-.54-.63-.85-.84-1.19-1.62-2.57-3.26-5.13-4.84-7.72-.49-.81-1.08-1.2-2-1.21h-.05Z'})
),
eyebrow
),
React.createElement('h1',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h1)',fontWeight:700,color:'var(--doxa-white)',margin:0,lineHeight:1.1}},headline),
body&&React.createElement('p',{style:{fontFamily:'var(--font-body)',fontSize:'var(--text-body-lg)',color:'rgba(255,255,255,.85)',marginTop:'var(--space-4)',lineHeight:1.6}},body),
children&&React.createElement('div',{style:{marginTop:'var(--space-6)',display:'flex',gap:'var(--space-3)'}},children)
)
);
}

function NavCta(props){
var variant=props.variant,tone=props.tone,ctaHref=props.ctaHref,ctaLabel=props.ctaLabel,style=props.style;
return React.createElement('a',{href:ctaHref,className:'ds-btn ds-btn-'+variant+(tone==='dark'?' on-dark':''),style:Object.assign({fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body-sm)',padding:'10px 20px',borderRadius:'var(--radius-md)',textDecoration:'none',display:'inline-flex',alignItems:'center',justifyContent:'center',position:'relative'},style)},ctaLabel);
}
function useIsMobile(bp){
var s=useState(typeof window!=='undefined'?window.innerWidth<bp:false),isMobile=s[0],setIsMobile=s[1];
useEffect(function(){
var onResize=function(){setIsMobile(window.innerWidth<bp);};
window.addEventListener('resize',onResize);
return function(){window.removeEventListener('resize',onResize);};
},[bp]);
return isMobile;
}
function DropdownPanel(props){
var item=props.item,open=props.open,dark=props.dark;
if(!item.columns)return null;
return React.createElement('div',{style:{position:'absolute',top:'calc(100% + 8px)',left:0,minWidth:520,background:dark?'#0a3352':'var(--surface-card)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)',border:dark?'1px solid rgba(255,255,255,.15)':'1px solid var(--border-subtle)',padding:'var(--space-6)',display:'flex',gap:'var(--space-8)',opacity:open?1:0,transform:open?'translateY(0)':'translateY(-6px)',pointerEvents:open?'auto':'none',transition:'opacity var(--duration-base) var(--ease-standard),transform var(--duration-base) var(--ease-standard)',zIndex:'var(--z-dropdown)'}},
item.columns.map(function(col,ci){return React.createElement('div',{key:ci,style:{display:'flex',flexDirection:'column',gap:10,minWidth:160}},
React.createElement('div',{style:{fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',color:dark?'rgba(255,255,255,.55)':'var(--text-muted)',marginBottom:4}},col.heading),
col.links.map(function(l,li){return React.createElement('a',{key:li,href:l.href,style:{fontSize:'var(--text-body-sm)',fontWeight:500,color:dark?'var(--text-inverse)':'var(--text-primary)',textDecoration:'none'}},l.label);})
);})
);
}
function NavItem(props){
var item=props.item,dark=props.dark;
var s=useState(false),open=s[0],setOpen=s[1];
var hasDropdown=!!item.columns;
return React.createElement('div',{onMouseEnter:function(){hasDropdown&&setOpen(true);},onMouseLeave:function(){hasDropdown&&setOpen(false);},style:{position:'relative'}},
React.createElement('a',{href:item.href||'#',style:{display:'inline-flex',alignItems:'center',gap:4,padding:'10px 4px',fontFamily:'var(--font-body)',fontSize:'var(--text-body-sm)',fontWeight:600,color:dark?'var(--text-inverse)':'var(--text-primary)',textDecoration:'none',cursor:'pointer'}},
item.label,
hasDropdown&&Icon('chevron-down',{width:12,height:12,style:{transition:'transform var(--duration-base) var(--ease-standard)',transform:open?'rotate(180deg)':'none'}})
),
React.createElement(DropdownPanel,{item:item,open:open,dark:dark})
);
}
function MobileItem(props){
var item=props.item,dark=props.dark;
var s=useState(false),open=s[0],setOpen=s[1];
var hasDropdown=!!item.columns;
return React.createElement('div',{style:{borderBottom:dark?'1px solid rgba(255,255,255,.12)':'1px solid var(--border-subtle)'}},
React.createElement('a',{href:hasDropdown?undefined:(item.href||'#'),onClick:hasDropdown?function(){setOpen(function(o){return !o;});}:undefined,style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 4px',fontFamily:'var(--font-body)',fontSize:'var(--text-body)',fontWeight:600,color:dark?'var(--text-inverse)':'var(--text-primary)',textDecoration:'none',cursor:'pointer'}},
item.label,
hasDropdown&&Icon('chevron-down',{width:14,height:14,style:{transition:'transform var(--duration-base) var(--ease-standard)',transform:open?'rotate(180deg)':'none'}})
),
hasDropdown&&React.createElement('div',{style:{maxHeight:open?600:0,overflow:'hidden',transition:'max-height var(--duration-base) var(--ease-standard)'}},
React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:18,padding:'4px 4px 18px'}},
item.columns.map(function(col,ci){return React.createElement('div',{key:ci,style:{display:'flex',flexDirection:'column',gap:8}},
React.createElement('div',{style:{fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',color:dark?'rgba(255,255,255,.55)':'var(--text-muted)'}},col.heading),
col.links.map(function(l,li){return React.createElement('a',{key:li,href:l.href,style:{fontSize:'var(--text-body-sm)',fontWeight:500,color:dark?'var(--text-inverse)':'var(--text-primary)',textDecoration:'none'}},l.label);})
);})
)
)
);
}
function Nav(props){
props=props||{};
var logo=props.logo,items=props.items||[],ctaLabel=props.ctaLabel||'Get Started',ctaHref=props.ctaHref||'#get-started',ctaVariant=props.ctaVariant||'accent',mobileBreakpoint=props.mobileBreakpoint||860;
var variant=props.variant||'primary';
var primary=variant==='primary';
var tone=props.tone||(primary?'dark':'light');
var dark=tone==='dark';
var isMobile=primary?false:useIsMobile(mobileBreakpoint);
var collapsed=primary?true:isMobile;
var m=useState(false),menuOpen=m[0],setMenuOpen=m[1];
var resolvedLogo=logo||(dark?'/_blob/f6034432430a0110a464e94d3d33894e':'/_blob/a315e9de089c3efdd965bda940a22136');
var navBg=dark?'var(--doxa-navy)':'var(--surface-card)';
var navBorder=dark?'1px solid rgba(255,255,255,.12)':'1px solid var(--border-subtle)';
var iconStyle=dark?{color:'#fff'}:{color:'var(--doxa-navy)'};
var toggleBtn=React.createElement('span',{onClick:function(){setMenuOpen(function(o){return !o;});},style:primary?Object.assign({cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'var(--radius-md)',border:'1px solid '+(dark?'rgba(255,255,255,.3)':'var(--border-subtle)')},iconStyle):Object.assign({cursor:'pointer'},iconStyle)},Icon(menuOpen?'x':'menu',{width:primary?20:24,height:primary?20:24}));
return React.createElement('div',{style:{position:'relative',fontFamily:'var(--font-body)'}},
React.createElement('nav',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'var(--space-4) var(--container-pad)',background:navBg,borderBottom:'4px solid transparent',borderImage:'var(--brand-gradient) 1'}},
React.createElement('img',{src:resolvedLogo,alt:'DOXA',style:{height:28,marginRight:'var(--space-8)'}}),
!collapsed&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'var(--space-6)'}},
items.map(function(it,i){return React.createElement(NavItem,{key:i,item:it,dark:dark});})
),
!collapsed&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'var(--space-4)'}},
React.createElement('span',{style:{cursor:'pointer',...iconStyle}},Icon('search',{width:18,height:18})),
React.createElement(NavCta,{variant:ctaVariant,tone:dark?'dark':'light',ctaHref:ctaHref,ctaLabel:ctaLabel,style:{whiteSpace:'nowrap'}})
),
collapsed&&primary&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'var(--space-4)'}},
React.createElement(NavCta,{variant:ctaVariant,tone:dark?'dark':'light',ctaHref:ctaHref,ctaLabel:ctaLabel,style:{whiteSpace:'nowrap'}}),
toggleBtn
),
collapsed&&!primary&&toggleBtn
),
collapsed&&React.createElement('div',{style:{position:'absolute',top:'100%',left:0,right:0,background:navBg,borderBottom:navBorder,boxShadow:'var(--shadow-lg)',maxHeight:menuOpen?'80vh':0,overflowY:'auto',opacity:menuOpen?1:0,transition:'opacity var(--duration-base) var(--ease-standard)',pointerEvents:menuOpen?'auto':'none',zIndex:'var(--z-sticky)',padding:menuOpen?'8px var(--container-pad) 20px':'0 var(--container-pad)'}},
items.map(function(it,i){return React.createElement(MobileItem,{key:i,item:it,dark:dark});}),
!primary&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:16,paddingTop:18}},
React.createElement('span',{style:iconStyle},Icon('search',{width:20,height:20})),
React.createElement(NavCta,{variant:ctaVariant,tone:dark?'dark':'light',ctaHref:ctaHref,ctaLabel:ctaLabel,style:{flex:1,textAlign:'center'}})
)
)
);
}

var footerSocials=[{label:'LinkedIn',icon:'linkedin',href:'#'},{label:'Facebook',icon:'facebook',href:'#'},{label:'Instagram',icon:'instagram',href:'#'},{label:'YouTube',icon:'youtube',href:'#'},{label:'TikTok',icon:'tiktok',href:'#'}];
function FooterLegalRow(props){
var links=props.links;
return React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'var(--space-1) var(--space-4)',fontSize:'var(--text-caption)',color:'rgba(255,255,255,.6)'}},
React.createElement('span',null,'Copyright © '+new Date().getFullYear()+' DOXA. All rights reserved.'),
links.map(function(l,i){return React.createElement('a',{key:i,href:l.href||'#',style:{color:'rgba(255,255,255,.6)',textDecoration:'underline'}},l.label);})
);
}
function Footer(props){
props=props||{};
var variant=props.variant||'standard',logo=props.logo||'/_blob/f6034432430a0110a464e94d3d33894e',legalLinks=props.legalLinks||[{label:'Privacy Policy'},{label:'Terms of Service'},{label:'For AI'}],columns=props.columns;
var wrap={background:'var(--doxa-navy)',color:'var(--text-inverse)',fontFamily:'var(--font-body)',padding:variant==='narrow'?'var(--space-8) var(--container-pad)':'var(--space-10) var(--container-pad) var(--space-6)'};
if(variant==='narrow'){
return React.createElement('footer',{style:wrap},
React.createElement('div',{style:{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--space-5)',textAlign:'center'}},
React.createElement('img',{src:logo,alt:'DOXA',style:{height:24}}),
React.createElement('nav',{style:{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'var(--space-5)',fontSize:'var(--text-body-sm)',fontWeight:600}},
(columns||[{label:'Why Attend'},{label:'Curriculum'},{label:'Speakers'},{label:'Events'},{label:'FAQ'}]).map(function(l,i){return React.createElement('a',{key:i,href:l.href||'#',style:{color:'var(--text-inverse)',textDecoration:'none'}},l.label);})
),
React.createElement(FooterLegalRow,{links:legalLinks})
)
);
}
var brandDescription=props.brandDescription||'Conscious Outsourcing®. Ethically employed, directly hired global teams across the Philippines, Colombia, Vietnam, and Kenya. 81 NPS · 50% better retention.';
var chips=props.chips||['SOC 2 Type I','NIST 2.0 aligned','Great Place to Work®','Fortune 100 Best Workplaces (SE Asia)'];
var copyright=props.copyright||'Copyright © '+new Date().getFullYear()+' DOXA. All rights reserved. Conscious Outsourcing® is a registered trademark of DOXA Talent.';
var defaultGroups=columns||[
{heading:'Roles',links:[{label:'Accountant (CPA)'},{label:'Outsourced Bookkeeper'},{label:'Outsourced AR/AP Clerk'},{label:'Outsourced Finance Specialist'},{label:'Outsourced Payroll Specialist'}]},
{heading:'Industries',links:[{label:'Accounting Firms'},{label:'Law Firms'},{label:'Healthcare & Medical Practices'},{label:'MSPs & IT Services'},{label:'View all industries →'}]},
{heading:'Company',links:[{label:'About DOXA'},{label:'Ethical Outsourcing'},{label:'Security & Compliance'},{label:'Careers'}]},
{heading:'Get Started',links:[{label:'Build your team'},{label:'Calculate your team cost'},{label:'Explore talent'}]}
];
return React.createElement('footer',{style:wrap},
React.createElement('div',{style:{display:'grid',gridTemplateColumns:'1.4fr repeat('+defaultGroups.length+',1fr)',gap:'var(--space-8)'}},
React.createElement('div',null,
React.createElement('img',{src:logo,alt:'DOXA',style:{height:32}}),
React.createElement('p',{style:{color:'rgba(255,255,255,.7)',fontSize:'var(--text-body-sm)',marginTop:'var(--space-4)',maxWidth:280}},brandDescription),
React.createElement('div',{style:{display:'flex',flexWrap:'wrap',alignItems:'center',gap:'var(--space-2)',marginTop:'var(--space-4)'}},
chips.map(function(c,i){return React.createElement(React.Fragment,{key:i},
React.createElement('span',{style:{fontSize:11,fontWeight:700,letterSpacing:'.03em',textTransform:'uppercase',color:'rgba(255,255,255,.85)'}},c),
i<chips.length-1&&React.createElement('span',{'aria-hidden':'true',style:{color:'rgba(255,255,255,.3)',fontWeight:400}},'|')
);})
)
),
defaultGroups.map(function(g,i){return React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',gap:10}},
React.createElement('div',{style:{fontSize:13,fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase',color:'var(--doxa-white)',marginBottom:4}},g.heading),
g.links.map(function(l,li){return React.createElement('a',{key:li,href:l.href||'#',style:{fontSize:14,color:'rgba(255,255,255,.7)',textDecoration:'none'}},l.label);})
);})
),
React.createElement('div',{style:{display:'flex',flexWrap:'wrap',gap:'var(--space-4)',alignItems:'center',justifyContent:'space-between',marginTop:'var(--space-8)',paddingTop:'var(--space-5)',borderTop:'1px solid rgba(255,255,255,.15)',fontSize:'var(--text-caption)',color:'rgba(255,255,255,.6)'}},
React.createElement('span',null,copyright),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'var(--space-6)',flexWrap:'wrap'}},
React.createElement('div',{style:{display:'flex',gap:'var(--space-4)'}},
legalLinks.map(function(l,i){return React.createElement('a',{key:i,href:l.href||'#',style:{color:'rgba(255,255,255,.6)',textDecoration:'underline'}},l.label);})
),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:14}},
footerSocials.map(function(s,i){return React.createElement('a',{key:i,href:s.href,'aria-label':s.label,style:{color:'#fff'}},Icon(s.icon,{width:18,height:18}));})
)
)
)
);
}

function ComparisonCell(props){
var value=props.value,onGradient=props.onGradient;
if(value==='yes')return MarkBadge('check',{size:20,onGradient:onGradient});
if(value==='no')return MarkBadge('x',{size:20});
if(value==='partial')return MarkBadge('tilde',{size:20});
return React.createElement('span',{style:{color:'var(--text-secondary)',fontSize:'var(--text-body-sm)'}},value);
}
function ComparisonTable(props){
props=props||{};
var columns=props.columns,rows=props.rows,highlightColumn=props.highlightColumn!==undefined?props.highlightColumn:1;
return React.createElement('table',{style:{width:'100%',borderCollapse:'collapse',fontFamily:'var(--font-body)',background:'var(--surface-card)',borderRadius:'var(--radius-lg)',overflow:'hidden',boxShadow:'var(--shadow-sm)'}},
React.createElement('thead',null,React.createElement('tr',null,
columns.map(function(c,i){return React.createElement('th',{key:i,style:{textAlign:i===0?'left':'center',padding:'14px 18px',fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',color:i===highlightColumn?'#fff':'var(--text-secondary)',background:i===highlightColumn?'var(--doxa-navy)':'var(--doxa-fog-50)',borderBottom:'1px solid var(--border-subtle)'}},c);})
)),
React.createElement('tbody',null,rows.map(function(r,ri){return React.createElement('tr',{key:ri,style:{borderBottom:ri<rows.length-1?'1px solid var(--border-subtle)':'none'}},
React.createElement('td',{style:{padding:'14px 18px',fontSize:'var(--text-body-sm)',fontWeight:500,color:'var(--text-primary)'}},r.feature),
r.values.map(function(v,vi){return React.createElement('td',{key:vi,style:{padding:'14px 18px',textAlign:'center',background:vi+1===highlightColumn?'var(--doxa-fog-50)':'transparent'}},React.createElement(ComparisonCell,{value:v}));})
);}))
);
}

function PricingTable(props){
props=props||{};
var title=props.title,badge=props.badge,rows=props.rows,totalLabel=props.totalLabel||'Est. total / year',totalValue=props.totalValue,tone=props.tone||'default';
var accent=tone==='accent';
return React.createElement('div',{style:{background:accent?'var(--doxa-navy)':'var(--surface-card)',border:accent?'none':'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-sm)',overflow:'hidden',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{padding:'var(--space-6) var(--space-6) 0',display:'flex',alignItems:'center',justifyContent:'space-between'}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h4)',fontWeight:700,color:accent?'var(--text-inverse)':'var(--text-primary)'}},title),
badge&&React.createElement('span',{style:{background:'var(--doxa-cyan)',color:'var(--doxa-navy)',fontSize:'var(--text-caption)',fontWeight:700,letterSpacing:'.03em',textTransform:'uppercase',padding:'4px 10px',borderRadius:'var(--radius-md)'}},badge)
),
React.createElement('div',{style:{padding:'var(--space-5) var(--space-6)',display:'flex',flexDirection:'column',gap:12}},
rows.map(function(r,i){return React.createElement('div',{key:i,style:{display:'flex',justifyContent:'space-between',fontSize:'var(--text-body-sm)',color:accent?'rgba(255,255,255,.85)':'var(--text-secondary)'}},
React.createElement('span',null,r.label),React.createElement('span',{style:{fontWeight:600,color:accent?'var(--text-inverse)':'var(--text-primary)'}},r.value)
);})
),
React.createElement('div',{style:{padding:'var(--space-5) var(--space-6)',borderTop:accent?'1px solid rgba(255,255,255,.15)':'1px solid var(--border-subtle)',display:'flex',justifyContent:'space-between',alignItems:'baseline'}},
React.createElement('span',{style:{fontSize:'var(--text-body-sm)',fontWeight:600,color:accent?'var(--text-inverse)':'var(--text-primary)'}},totalLabel),
React.createElement('span',{style:{fontFamily:'var(--font-display)',fontSize:'var(--text-h3)',fontWeight:700,color:accent?'var(--doxa-cyan)':'var(--doxa-navy)'}},totalValue)
)
);
}

function StepList(props){
props=props||{};
var steps=props.steps,tone=props.tone||'light';
var dark=tone==='dark';
if(tone==='grid'){
return React.createElement('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:'var(--space-4)',fontFamily:'var(--font-body)'}},
steps.map(function(s,i){return React.createElement('div',{key:i,style:{borderRadius:14,padding:'var(--space-6)',display:'flex',flexDirection:'column',gap:'var(--space-3)',background:'var(--paper-soft)',border:'1px solid var(--fog-100)'}},
React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:8}},
React.createElement('span',{style:{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'1.5rem',lineHeight:1,letterSpacing:'-0.04em',background:'var(--brand-gradient)',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',color:'transparent'}},String(i+1).padStart(2,'0')),
React.createElement('h3',{style:{margin:0,fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-h4)',lineHeight:1.2,color:'var(--text-primary)'}},s.title)
),
React.createElement('p',{style:{margin:0,fontSize:'var(--text-body)',color:'var(--text-secondary)',lineHeight:1.55}},s.description)
);})
);
}
if(dark){
return React.createElement('div',{style:{display:'flex',gap:'var(--space-4)',fontFamily:'var(--font-body)'}},
steps.map(function(s,i){return React.createElement('div',{key:i,style:{flex:1,background:'var(--surface-dark-alt)',borderRadius:'var(--radius-lg)',padding:'var(--space-5)',display:'flex',flexDirection:'column',gap:'var(--space-3)',boxShadow:'var(--shadow-md)'}},
React.createElement('div',{style:{width:36,height:36,borderRadius:'50%',background:'var(--brand-gradient)',color:'var(--doxa-navy)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-body)'}},i+1),
React.createElement('div',null,
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body-lg)',color:'var(--text-inverse)',marginBottom:4}},s.title),
React.createElement('div',{style:{fontSize:'var(--text-body-sm)',color:'rgba(255,255,255,.7)',lineHeight:'var(--leading-normal)'}},s.description)
)
);})
);
}
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:0,fontFamily:'var(--font-body)'}},
steps.map(function(s,i){return React.createElement('div',{key:i,style:{display:'flex',gap:'var(--space-4)',padding:'var(--space-4) 0',borderBottom:i<steps.length-1?'1px solid var(--border-subtle)':'none'}},
React.createElement('div',{style:{flexShrink:0,width:36,height:36,borderRadius:'50%',background:'var(--doxa-navy)',color:'var(--text-inverse)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-body)'}},i+1),
React.createElement('div',null,
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body-lg)',color:'var(--text-primary)',marginBottom:4}},s.title),
React.createElement('div',{style:{fontSize:'var(--text-body-sm)',color:'var(--text-secondary)',lineHeight:'var(--leading-normal)'}},s.description)
)
);})
);
}

function TestimonialCard(props){
props=props||{};
var quote=props.quote,name=props.name,title=props.title,company=props.company,rating=props.rating!==undefined?props.rating:5,photo=props.photo,tone=props.tone||'light';
var dark=tone==='dark';
var style=dark?{background:'rgba(255,255,255,.14)',backdropFilter:'blur(18px) saturate(160%)',WebkitBackdropFilter:'blur(18px) saturate(160%)',border:'1px solid rgba(255,255,255,.35)',boxShadow:'0 8px 24px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.4)'}:{background:'var(--surface-card)',border:'1px solid var(--border-subtle)',boxShadow:'var(--shadow-sm)'};
return React.createElement('div',{style:Object.assign({},style,{borderRadius:'var(--radius-lg)',padding:'var(--space-6)',fontFamily:'var(--font-body)',display:'flex',flexDirection:'column',gap:'var(--space-4)'})},
React.createElement('div',{style:{display:'flex',gap:2,color:'#F1AF21'}},Array.from({length:5}).map(function(_,i){return React.createElement('span',{key:i,style:{opacity:i<rating?1:(dark?0.3:0.2)}},i<rating?FilledStar({width:14,height:14}):Icon('star',{width:14,height:14}));})),
React.createElement('p',{style:{fontSize:'var(--text-body)',lineHeight:1.3,color:dark?'var(--text-inverse)':'var(--text-primary)',margin:0}},'“',quote,'”'),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,marginTop:'auto'}},
photo?React.createElement('img',{src:photo,alt:name,style:{width:44,height:44,borderRadius:'50%',objectFit:'cover'}}):React.createElement('div',{style:{width:44,height:44,borderRadius:'50%',background:dark?'rgba(255,255,255,.15)':'var(--doxa-fog-100)',color:dark?'var(--text-inverse)':'var(--text-muted)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontWeight:600}},name?name[0]:'?'),
React.createElement('div',null,
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body-sm)',color:dark?'var(--text-inverse)':'var(--text-primary)'}},name),
React.createElement('div',{style:{fontSize:'var(--text-caption)',color:dark?'rgba(255,255,255,.7)':'var(--text-secondary)'}},title,company?', '+company:'')
)
)
);
}

function BadgeStrip(props){
props=props||{};
var items=props.items;
return React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'var(--space-6)',flexWrap:'wrap',padding:'var(--space-4) 0'}},
items.map(function(it,i){return React.createElement('img',{key:i,src:it.src,alt:it.alt||'',style:{height:40,width:'auto',objectFit:'contain',opacity:.9}});})
);
}

function Stat(props){
props=props||{};
var value=props.value,label=props.label,tone=props.tone||'light';
var dark=tone==='dark';
return React.createElement('div',{style:{textAlign:'left',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-display-2)',color:dark?'var(--doxa-cyan)':'var(--doxa-navy)',lineHeight:1.1}},value),
React.createElement('div',{style:{fontSize:'var(--text-body-sm)',color:dark?'rgba(255,255,255,.75)':'var(--text-secondary)',marginTop:4}},label)
);
}

function RoleCard(props){
props=props||{};
var image=props.image,title=props.title,description=props.description,href=props.href,label=props.label||'Learn More',aspect=props.aspect||'landscape';
var ratio=aspect==='portrait'?'500/650':'16/10';
var s=useState(false),hover=s[0],setHover=s[1];
return React.createElement('a',{href:href,onMouseEnter:function(){setHover(true);},onMouseLeave:function(){setHover(false);},style:{display:'block',position:'relative',textDecoration:'none',color:'inherit',background:'var(--surface-card)',WebkitTextFillColor:'unset',borderRadius:'var(--radius-lg)',overflow:'hidden',boxShadow:'var(--shadow-md)',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{position:'absolute',top:0,left:0,right:0,height:4,background:'var(--brand-gradient)'}}),
image&&React.createElement('div',{style:{aspectRatio:ratio,background:"url('"+image+"') center/cover"}}),
React.createElement('div',{style:{padding:'var(--space-5)'}},
React.createElement('div',{style:{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-h4)',color:'var(--text-primary)',marginBottom:6}},title),
React.createElement('div',{style:{fontSize:'var(--text-body-sm)',color:'var(--text-secondary)',marginBottom:14}},description),
React.createElement('span',{style:Object.assign({display:'inline-flex',alignItems:'center',gap:4,fontSize:'var(--text-eyebrow)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',textDecoration:'underline',textUnderlineOffset:2,textDecorationColor:hover?'var(--doxa-green)':'var(--doxa-navy)'},hover?{background:'var(--brand-gradient)',backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',color:'transparent'}:{color:'var(--doxa-navy)'})},label,BrandChevron({width:8,height:12,style:{color:hover?'var(--doxa-green)':'var(--doxa-navy)',marginTop:1}}))
)
);
}

function FAQItem(props){
var it=props.it,isOpen=props.isOpen,onToggle=props.onToggle,dark=props.dark;
var s=useState(false),hover=s[0],setHover=s[1];
var plusColor=dark?(isOpen?'var(--text-inverse)':(hover?'var(--doxa-green)':'var(--doxa-cyan)')):(isOpen?'var(--doxa-white)':'var(--doxa-navy)');
var filled=dark?isOpen:isOpen;
return React.createElement('div',{style:{borderBottom:dark?'2px solid rgba(0,174,239,.4)':'2px solid var(--border-subtle)'}},
React.createElement('button',{onClick:onToggle,onMouseEnter:function(){setHover(true);},onMouseLeave:function(){setHover(false);},style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'var(--space-4)',margin:filled?'0 calc(-1*var(--space-4))':0,boxSizing:'border-box',background:dark?(isOpen?'var(--brand-gradient)':(hover?'rgba(255,255,255,.08)':'none')):(isOpen?'var(--doxa-navy)':'none'),borderRadius:filled?'var(--radius-md)':0,border:'none',cursor:'pointer',textAlign:'left',fontFamily:'var(--font-display)',fontWeight:600,fontSize:'var(--text-body)',color:dark?'var(--text-inverse)':(isOpen?'var(--doxa-white)':'var(--text-primary)'),transition:'background var(--duration-base) var(--ease-standard),color var(--duration-base) var(--ease-standard)'}},
React.createElement('span',null,it.question),
React.createElement('span',{style:{position:'relative',flexShrink:0,width:16,height:16}},
React.createElement('span',{style:{position:'absolute',top:'50%',left:0,width:16,height:3,background:plusColor,transform:'translateY(-50%)',transition:'background var(--duration-base) var(--ease-standard)'}}),
React.createElement('span',{style:{position:'absolute',top:0,left:'50%',width:3,height:16,background:plusColor,transform:isOpen?'translateX(-50%) scaleY(0)':'translateX(-50%) scaleY(1)',transition:'transform var(--duration-base) var(--ease-standard),background var(--duration-base) var(--ease-standard)'}})
)
),
isOpen&&React.createElement('div',{style:{padding:'var(--space-3) 24px var(--space-5) var(--space-4)',fontSize:'var(--text-body-sm)',color:dark?'rgba(255,255,255,.8)':'var(--doxa-navy)',lineHeight:'var(--leading-relaxed)'}},it.answer)
);
}
function FAQAccordion(props){
props=props||{};
var items=props.items,defaultOpen=props.defaultOpen!==undefined?props.defaultOpen:0,tone=props.tone||'light';
var s=useState(defaultOpen),open=s[0],setOpen=s[1];
var dark=tone==='dark';
return React.createElement('div',{style:{fontFamily:'var(--font-body)',borderTop:dark?'2px solid rgba(0,174,239,.4)':'1px solid var(--border-subtle)'}},
items.map(function(it,i){return React.createElement(FAQItem,{key:i,it:it,dark:dark,isOpen:open===i,onToggle:function(){setOpen(open===i?-1:i);}});})
);
}

function EventCard(props){
props=props||{};
var eyebrow=props.eyebrow||'AI in Action',cityLabel=props.cityLabel,stateAbbr=props.stateAbbr,dateShort=props.dateShort,address=props.address,hostName=props.hostName,hostHref=props.hostHref,statusLabel=props.statusLabel,completed=!!props.completed,href=props.href;
var s=useState(false),hover=s[0],setHover=s[1];
var meta=[['Date',dateShort],['Address',address]];
return React.createElement('div',{style:{position:'relative',display:'flex',flexDirection:'column',width:'100%',minWidth:0,boxSizing:'border-box',borderRadius:'var(--radius-lg)',background:'var(--surface-card)',boxShadow:'var(--shadow-sm)',overflow:'hidden',transform:hover?'translateY(-2px)':'none',transition:'transform var(--duration-base) var(--ease-standard)',fontFamily:'var(--font-body)'}},
React.createElement('a',{href:href,'aria-label':'View '+cityLabel+' event details',onMouseEnter:function(){setHover(true);},onMouseLeave:function(){setHover(false);},style:{position:'absolute',inset:0,zIndex:1}}),
React.createElement('div',{style:{height:3,flexShrink:0,background:'var(--brand-gradient)'}}),
React.createElement('div',{style:{padding:'var(--space-6)',display:'flex',flexDirection:'column',flex:1,minHeight:0}},
React.createElement('p',{style:{margin:'0 0 4px',fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',color:'var(--doxa-cyan-a11y)'}},eyebrow),
React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginBottom:'var(--space-4)'}},
React.createElement('h3',{style:{margin:0,fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-h4)',color:completed?'var(--text-secondary)':'var(--text-primary)',textDecoration:completed?'line-through':'none'}},cityLabel),
stateAbbr&&React.createElement('span',{style:{fontWeight:500,color:'var(--text-secondary)',textDecoration:completed?'line-through':'none'}},stateAbbr)
),
React.createElement('dl',{style:{margin:'0 0 var(--space-4)',display:'flex',flexDirection:'column',gap:8,fontSize:'var(--text-body-sm)'}},
meta.map(function(pair){return React.createElement('div',{key:pair[0],style:{display:'flex',gap:8,minWidth:0}},
React.createElement('dt',{style:{width:56,flexShrink:0,color:'var(--text-muted)'}},pair[0]),
React.createElement('dd',{style:{margin:0,minWidth:0,overflowWrap:'break-word',fontWeight:500,color:'var(--text-secondary)'}},pair[1])
);}),
React.createElement('div',{style:{display:'flex',gap:8,minWidth:0}},
React.createElement('dt',{style:{width:56,flexShrink:0,color:'var(--text-muted)'}},'Host'),
React.createElement('dd',{style:{margin:0,minWidth:0,overflowWrap:'break-word',fontWeight:500}},
hostHref?React.createElement('a',{href:hostHref,style:{position:'relative',zIndex:2,color:'var(--doxa-cyan-a11y)',textDecoration:'underline',textUnderlineOffset:2}},hostName):React.createElement('span',{style:{color:'var(--text-secondary)'}},hostName)
)
)
),
React.createElement('div',{style:{marginTop:'auto',marginBottom:'var(--space-4)'}},
React.createElement('span',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:999,fontSize:'var(--text-caption)',fontWeight:600,border:'1px solid '+(completed?'var(--border-subtle)':'rgba(5,175,114,.3)'),background:completed?'var(--doxa-fog-50)':'rgba(5,175,114,.1)',color:completed?'var(--text-secondary)':'var(--doxa-green-dark)'}},
React.createElement('span',{style:{width:6,height:6,borderRadius:'50%',background:completed?'var(--text-muted)':'var(--doxa-green)'}}),
statusLabel
)
),
React.createElement('span',{style:{display:'inline-flex',width:'100%',flexShrink:0,alignItems:'center',justifyContent:'center',gap:8,padding:'10px 16px',borderRadius:'var(--radius-md)',border:'1px solid var(--border-subtle)',fontSize:'var(--text-body-sm)',fontWeight:600,color:'var(--text-primary)',background:hover?'var(--doxa-fog-50)':'transparent',transition:'background var(--duration-base) var(--ease-standard)'}},
'View Event',
React.createElement('span',{style:{display:'inline-flex',transform:hover?'translateX(2px)':'none',transition:'transform var(--duration-base) var(--ease-standard)'}},Icon('chevron-right',{width:14,height:14}))
)
)
);
}

function SpeakerCard(props){
props=props||{};
var image=props.image,name=props.name,role=props.role,org=props.org,bio=props.bio,linkedin=props.linkedin,facts=props.facts;
return React.createElement('div',{style:{display:'grid',gridTemplateColumns:'auto 1fr',gap:'var(--space-6)',fontFamily:'var(--font-body)'}},
React.createElement('img',{src:image,alt:name,width:96,height:96,style:{width:96,height:96,borderRadius:'50%',objectFit:'cover',flexShrink:0}}),
React.createElement('div',null,
React.createElement('p',{style:{margin:'0 0 4px',fontSize:'var(--text-caption)',fontWeight:600,letterSpacing:'var(--tracking-eyebrow)',textTransform:'uppercase',color:'var(--text-primary)'}},role),
React.createElement('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:4}},
React.createElement('h3',{style:{margin:0,fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--text-h4)',color:'var(--text-primary)'}},name),
linkedin&&React.createElement('a',{href:linkedin,style:{display:'inline-flex',alignItems:'center',gap:4,fontSize:'var(--text-caption)',color:'var(--doxa-cyan-a11y)',textDecoration:'underline',textUnderlineOffset:3}},'LinkedIn')
),
React.createElement('p',{style:{margin:'0 0 var(--space-4)',fontSize:'var(--text-body-sm)',color:'var(--text-secondary)'}},org),
React.createElement('p',{style:{margin:0,maxWidth:520,whiteSpace:'pre-line',fontSize:'var(--text-body-sm)',lineHeight:'var(--leading-relaxed)',color:'var(--text-primary)'}},bio),
facts&&React.createElement('ul',{style:{listStyle:'none',display:'flex',flexWrap:'wrap',gap:8,margin:'var(--space-4) 0 0',padding:0,fontSize:'var(--text-caption)',color:'var(--text-secondary)'}},
facts.map(function(f){return React.createElement('li',{key:f,style:{border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)',padding:'4px 12px'}},f);})
)
)
);
}

/* ============================= export ==================================== */
window.DoxaDS={
Button:Button,IconButton:IconButton,Input:Input,Select:Select,Checkbox:Checkbox,Radio:Radio,Switch:Switch,ValidationSummary:ValidationSummary,ChoiceCard:ChoiceCard,AddAnotherLink:AddAnotherLink,
Badge:Badge,Tag:Tag,Chip:Chip,Toast:Toast,Tooltip:Tooltip,Spinner:Spinner,Skeleton:Skeleton,EmptyState:EmptyState,ErrorState:ErrorState,
Card:Card,Tabs:Tabs,Dialog:Dialog,Breadcrumb:Breadcrumb,Pagination:Pagination,SkipLink:SkipLink,
Hero:Hero,Nav:Nav,Footer:Footer,ComparisonTable:ComparisonTable,PricingTable:PricingTable,StepList:StepList,TestimonialCard:TestimonialCard,BadgeStrip:BadgeStrip,Stat:Stat,RoleCard:RoleCard,FAQAccordion:FAQAccordion,EventCard:EventCard,SpeakerCard:SpeakerCard
};
})();
