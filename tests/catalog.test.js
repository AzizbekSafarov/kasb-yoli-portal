import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,filterCourses,localRecommendations} from '../shared/catalog.js';
test('kamida 6 ta to‘liq, noyob kurs va 3 ta amaliy qadam mavjud',()=>{assert.ok(courses.length>=6);assert.equal(new Set(courses.map(c=>c.id)).size,courses.length);for(const c of courses){for(const key of ['title','course','category','format','duration','level','tasks','project'])assert.ok(c[key]);assert.equal(c.steps.length,3);assert.ok(c.skills.length>=3);}});
test('qidiruv, yo‘nalish va format birgalikda ishlaydi',()=>{assert.deepEqual(filterCourses({query:'PYTHON',category:'Dasturlash',format:'Gibrid'}).map(c=>c.id),['python']);assert.equal(filterCourses({query:'   '}).length,courses.length);assert.equal(filterCourses({query:'mavjudemas'}).length,0);assert.deepEqual(filterCourses({query:'Maʼlumotlar'}).map(c=>c.id),['data']);});
test('mahalliy yordamchi faqat mavjud kasblarni tanlaydi',()=>{const result=localRecommendations('rasm dizayn ijod','new');assert.equal(result[0].courseId,'ux');for(const rec of result)assert.ok(courses.some(c=>c.id===rec.courseId));});
