/***********************************/
/*https://codepen.io/zb3/pen/myMxQr*/
/***********************************/

/*
timeout release!
Scrapped because of a timeout - I want to do another thing that will be scrapped because of a timeout!

+Shittiest code quality ever
+Integrity guaranteed - one modification will break everything
+Desired effect not achieved
+100% incorrect physics
+Not configurable @ all, important constants defined in random places (or literals used)
+Of course it doesn't support touch


*/


var tx = document.getElementById('cabview').getContext('2d');
var x, y, vp;

function setSize()
{
 tx.canvas.width = x = innerWidth; tx.canvas.height = y =innerHeight;
 vp = Math.max(x, y);
}
addEventListener('resize', setSize);
setSize();

var bg = 'black';
var scale = 555, clip = 100, far = 5, fact = 1;
var ccn = 4, cfact = 1, alpha = 1;

//global "projection"
var crot = [0, 0, 0], cmove = [0, 0, 0];
var speed = 1;

var cwhite = [255, 255, 255];
var pts = []; //source [x, y, z, radius, color, vx, vy, vz]
var pts2 = []; //dest

function rotPoint(pt, a, b, c)
{
 var tx, ty, tz;
 tx = pt[0]*Math.cos(a)-pt[1]*Math.sin(a);
 ty = pt[1]*Math.cos(a)+pt[0]*Math.sin(a);
 pt[0] = tx; pt[1] = ty;

 tx = pt[0]*Math.cos(b)-pt[2]*Math.sin(b);
 tz = pt[2]*Math.cos(b)+pt[0]*Math.sin(b);
 pt[0] = tx; pt[2] = tz;

 ty = pt[1]*Math.cos(c)-pt[2]*Math.sin(c);
 tz = pt[2]*Math.cos(c)+pt[1]*Math.sin(c);
 pt[1] = ty; pt[2] = tz;
}
function projectPoints()
{
 var t, tx, ty, tz;
 pts2.length = 0;
 for(t=0;t<pts.length;t++)
 {
  pts2[t] = pts[t].slice();

  rotPoint(pts2[t], crot[0], crot[1], crot[2]);

  pts2[t][0] += cmove[0]; pts2[t][1] += cmove[1]; pts2[t][2] += cmove[2];
 }
}
function paintPoints()
{
 projectPoints();
 pts2.sort(function(a,b){return b[2]-a[2]});
 tx.fillStyle = 'rgba(0, 0, 0, 0.75)';
 tx.fillRect(0, 0, x, y);

 var t, zt, ac;
 for(t=0;t<pts2.length;t++)
 {
  zt = far+fact*pts2[t][2];
  if (zt>0)
  {
   tx.beginPath();
   tx.fillStyle = 'rgba('+Math.min(ccn*(pts2[t][4][0]/(cfact*zt))|0,255)+','+Math.min(ccn*(pts2[t][4][1]/(cfact*zt))|0,255)+','+Math.min(ccn*(pts2[t][4][2]/(cfact*zt))|0,255)+','+alpha+')';
   tx.arc(x/2+scale*pts2[t][0]/zt, y/2-scale*pts2[t][1]/zt, scale*pts2[t][3]/zt, 0, 2*Math.PI);
   tx.fill();
  }
 }
}
function movePoints()
{
 var t;
 for(t=0;t<pts.length;t++)
 {
  pts[t][0] += pts[t][5]*speed;
  pts[t][1] += pts[t][6]*speed;
  pts[t][2] += pts[t][7]*speed;
  if (Math.abs(pts[t][0])>clip || Math.abs(pts[t][1])>clip || Math.abs(pts[t][2])>clip)
  pts.splice(t--, 1);
 }
}


function qmult(q1, q2)
{
 var nv = [0, 0, 0, 0];
 nv[3] = q1[3]*q2[3]-q1[0]*q2[0]-q1[1]*q2[1]-q1[2]*q2[2];
 nv[0] = q1[3]*q2[0]+q1[0]*q2[3]+q1[1]*q2[2]-q1[2]*q2[1];
 nv[1] = q1[3]*q2[1]-q1[0]*q2[2]+q1[1]*q2[3]+q1[2]*q2[0];
 nv[2] = q1[3]*q2[2]+q1[0]*q2[1]-q1[1]*q2[0]+q1[2]*q2[3];
 return nv;
}
function rv(v, ax, angle)
{
 if (v.length==3) v.push(0);
 v[3] = 0;
 
 var a2 = [ax[0]*Math.sin(angle/2), ax[1]*Math.sin(angle/2), ax[2]*Math.sin(angle/2), Math.cos(angle/2)]
 var ma2 = [-a2[0], -a2[1], -a2[2], a2[3]];
 var nv = qmult(a2, v);
 nv = qmult(nv, ma2);
 return nv;
}
function getRandomRingPoint(v, amax, l) //uses triangle dist
{
 if (v.length==3) v.push(0);
 v[3] = 0;

 var l2, vp;
 if (v[0] || v[1])
 {
  l2 = Math.sqrt(v[0]*v[0]+v[1]*v[1]);
  vp = [l*v[1]/l2, -l*v[0]/l2, 0];
 }
 else
 {
  l2 = Math.sqrt(v[0]*v[0]+v[2]*v[2]);
  vp = [-l*v[2]/l2, 0, l*v[0]/l2];
 }

 vp = rv(vp, v, 2*Math.random()*Math.PI)
 vc = [v[1]*vp[2]-v[2]*vp[1], v[2]*vp[0]-v[0]*vp[2], v[0]*vp[1]-v[1]*vp[0]]
 lp = Math.sqrt(vc[0]*vc[0]+vc[1]*vc[1]+v[2]*v[2]);
 vc[0] /= lp; vc[1] /= lp; vc[2] /= lp;
 vp = rv(vp, vc, (Math.random()*amax+Math.random()*amax)-amax)


 return vp;
}

/////////////////
var since = -1, texp = 1800;


function checkCollisions()
{
 var ch = false, t;

 mt:for(t=0;t<pts.length;t++)
 for(t2=t+1;t2<pts.length;t2++)
 {
  if (!pts[t].collides || !pts[t2].collides) continue;
  if (Math.sqrt((pts[t][0]-pts[t2][0])*(pts[t][0]-pts[t2][0]) + (pts[t][1]-pts[t2][1])*(pts[t][1]-pts[t2][1]) + (pts[t][2]-pts[t2][2])*(pts[t][2]-pts[t2][2]))<(pts[t][3]+pts[t2][3]))
  {
   ch = true;
   onCollision(pts[t], pts[t2]);
   pts.splice(t2, 1);
   pts.splice(t--, 1);
   continue mt;
  }
 }
 if (ch)
 since = 0;
}
function onCollision(a, b)
{
 //collision center
 var cc = [(a[3]*a[0]+b[3]*b[0])/(a[3]+b[3]), (a[3]*a[1]+b[3]*b[1])/(a[3]+b[3]), (a[3]*a[2]+b[3]*b[2])/(a[3]+b[3])];

 //collision vector
 var cv = [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
 var cvl = Math.sqrt(cv[0]*cv[0]+cv[1]*cv[1]+cv[2]*cv[2]);
 cv[0] /= cvl; cv[1] /= cvl; cv[2] /= cvl;

 var mass_a = Math.PI*a[3]*a[3]*a[3]*4/3, mass_b = Math.PI*b[3]*b[3]*b[3]*4/3;

 var mass_left = mass_a + mass_b;

 //possibly incorrect physics :)
 var inertia_left = mass_a*(Math.sqrt(a[5]*a[5]+a[6]*a[6]+a[7]*a[7])) + mass_b*Math.sqrt(b[5]*b[5]+b[6]*b[6]+b[7]*b[7]);

 var desired = 670, avg_mass = mass_left/desired, mr = 2*avg_mass;

 var avg_speed = inertia_left/(desired*avg_mass), ar = 3*avg_speed;
 var avg_inertia = inertia_left/desired; //not used
 
 var this_mass, this_speed;
 while(mass_left>0)
 {
  this_mass = avg_mass + (Math.random()*mr);
  //method 1 - speed doesn't depend on mass
  this_speed = avg_speed + (Math.random()*ar)-ar/2; //maybe a little faster
  var rr = getRandomRingPoint(cv, 0.6, this_speed);
  pts.push([cc[0]+rr[0], cc[1]+rr[1], cc[2]+rr[2], Math.cbrt(3*this_mass/(4*Math.PI)), cwhite, rr[0], rr[1], rr[2]]);
  mass_left -= this_mass;
 }

}
function ag()
{
 for(var t=0;t<pts.length;t++)
 {

  if (pts[t].collides) continue;
  pts[t][6] -= 0.002*speed;
 }
}

function generateScene()
{
 var dist = 10;
 var mc, r1 = Math.random()*0.15+0.07, r2 = Math.random()*0.15+0.07;
 
 pts.push([0, 0, r1, cwhite, 0, 0, 0], [0, 0, r2, cwhite, 0, 0, 0]);

 var ml, ma, mw, cv, ts, bs = -1, bmc, bml, bma, bmw, watchdog = 1000;

 while(true && watchdog-->0) //coz this wasn't meant to be "canvas fireforks"
 {
  mc = Math.floor(Math.random()*3)
  ml = 0.2*Math.random()*(r1+r2);
  ma = Math.random()*2*Math.PI;
  mw = Math.random()>0.5?1:0;

  pts[pts.length-1-mw][0] = ml*Math.cos(ma); pts[pts.length-1-mw][1] = ml*Math.sin(ma);

  cv = [pts[pts.length-2][0]-pts[pts.length-1][0], pts[pts.length-2][1]-pts[pts.length-1][1]];
 cv.splice(mc, 0, Math.sqrt((r1+r2)*(r1+r2) - Math.pow((pts[pts.length-1][0]-pts[pts.length-2][0]), 2) - Math.pow((pts[pts.length-1][1]-pts[pts.length-2][1]), 2)));

  rotPoint(cv, crot[0], crot[1], crot[2]);
  ts = cv[2]/(Math.sqrt(cv[0]*cv[0] + cv[1]*cv[1] + cv[2]*cv[2]));
  if (Math.abs(ts)>bs)
  {
   bs = Math.abs(ts);
   bmc = mc; bml = ml; bma = ma; bmw = mw;
  }
  if (Math.abs(ts)<0.4)
  break;
 }
 if (watchdog<0)
 {
  pts[pts.length-1-bmw][0] = bml*Math.cos(bma); pts[pts.length-1-bmw][1] = bml*Math.sin(bma);
  mc = bmc;
 }

 pts[pts.length-2].splice(mc, 0, dist);
 pts[pts.length-1].splice(mc, 0, -dist);

 var s1 = 0.063+Math.random()*0.03, s2 = 0.063+Math.random()*0.03;
 pts[pts.length-1][5+mc] = s1;
 pts[pts.length-2][5+mc] = -s2;
 
 pts[pts.length-1].collides = true;
 pts[pts.length-2].collides = true;
}

var fps = 17;
crot[1] = 0.5
generateScene();

function cassyo(pre)
{
 
 if (since>=0)
 since += fps*speed;


 ag();
 movePoints();
 checkCollisions();

 if (since>texp)
 {
  generateScene();
  since = -1;
 }

 if (!pre)
 setTimeout(cassyo, fps); //b
}
for(var t=0;t<85;t++)
cassyo(true);

cassyo();

function paintCassyO()
{
 paintPoints();
 requestAnimationFrame(paintCassyO);
}
paintCassyO()

document.addEventListener('wheel', function(event)
{
 far += 0.5*Math.sign(event.deltaY);
 far = Math.max(1, far);
});
document.addEventListener('mousedown', startControlls);
function startControlls(event)
{
 document.addEventListener('mousemove', onMouseDrag);
 document.addEventListener('mouseup', endControlls);
 onMouseDrag.lastX = event.clientX; onMouseDrag.lastY = event.clientY;
 speed = 0.03;
}
function onMouseDrag(event)
{
 crot[1] += 0.005*(event.clientX-onMouseDrag.lastX);  crot[2] -= 0.005*(event.clientY-onMouseDrag.lastY);
 crot[2] = Math.max(-Math.PI/2, Math.min(Math.PI/2, crot[2]));
 onMouseDrag.lastX = event.clientX; onMouseDrag.lastY = event.clientY;
}
function endControlls(event)
{
 speed =1;
 document.removeEventListener('mousemove', onMouseDrag);
 document.removeEventListener('mouseup', endControlls);
}