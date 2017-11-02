import {MRJob} from './mr';

const {$} = window;

class JobStore {
  constructor() {
    this.pipes = {};
    this.lastJob = null;
  }

  getJob(id) {
    this.lastJob = id;
    $.getJSON(`/jobs/${id}`).then((data) => {
      this.trigger('job', new MRJob(data));
    }).then(null, (error) => console.error(error));
  }

  getJobs() {
    $.getJSON('/jobs/').then((data) => {
      console.log('GOT DATA', data);
      debugger; // eslint-disable-line
      this.trigger('jobs', data.map((d) => new MRJob(d)));
    }).then(null, (error) => console.error(error));
  }

  startSSE() {
    const sse = new EventSource('/sse');
    sse.onmessage = (e) => {
      this.trigger('job', new MRJob(JSON.parse(e.data)));
    };
  }

  trigger(key, data) {
    (this.pipes[key] || []).map((f) => f(data));
  }

  on(key, f) {
    (this.pipes[key] = this.pipes[key] || []).push(f);
  }
}

export const Store = new JobStore();
