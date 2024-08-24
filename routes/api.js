"use strict";

class Issues {
  constructor(
    project,
    issue_title,
    issue_text,
    created_by,
    assigned_to = "",
    status_text = ""
  ) {
    this.project = project;
    this._id = new Date().getTime().toString();
    this.issue_title = issue_title;
    this.issue_text = issue_text;
    this.created_by = created_by;
    this.assigned_to = assigned_to;
    this.status_text = status_text;
    this.open = true;
    this.created_on = new Date();
    this.updated_on = new Date();
  }
  addToDb() {
    db.push(this);
  }

  updateIssue(
    _id,
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
    open
  ) {
    const index = db.findIndex((issue) => issue._id === _id);
    console.log("This is working");
    if (index !== -1) {
      db[index].issue_title = issue_title || this.issue_title;
      db[index].issue_text = issue_text || this.issue_text;
      db[index].created_by = created_by || this.created_by;
      db[index].assigned_to = assigned_to || this.assigned_to;
      db[index].status_text = status_text || this.status_text;
      db[index].updated_on = new Date();
      db[index].open = open ? false : true;
    }
  }

  returnCreatedJson() {
    return {
      assigned_to: this.assigned_to,
      status_text: this.status_text,
      open: this.open,
      _id: this._id,
      issue_title: this.issue_title,
      issue_text: this.issue_text,
      created_by: this.created_by,
      created_on: this.created_on,
      updated_on: this.updated_on,
    };
  }
}

const db = [];

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.query;

      let project = req.params.project;

      let filteredIssues = db.filter((issue) => {
        return (
          issue.project === project &&
          (!_id || issue._id === _id) &&
          (!issue_title || issue.issue_title === issue_title) &&
          (!issue_text || issue.issue_text === issue_text) &&
          (!created_by || issue.created_by === created_by) &&
          (!assigned_to || issue.assigned_to === assigned_to) &&
          (!status_text || issue.status_text === status_text) &&
          (open === undefined || issue.open === (open === "true"))
        );
      });

      let responseIssues = filteredIssues.map((issue) => {
        const { project, ...issueWithoutProject } = issue;
        return issueWithoutProject;
      });

      res.json(responseIssues);
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.status(200).json({ error: "required field(s) missing" });
      } else {
        const issue = new Issues(
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text
        );
        issue.addToDb();
        res.json(issue.returnCreatedJson());
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
      console.log(req.body);
      console.log(req.url);

      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      // Check if all fields are undefined or empty
      if (
        issue_title === undefined &&
        issue_text === undefined &&
        created_by === undefined &&
        assigned_to === undefined &&
        status_text === undefined &&
        open === undefined
      ) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }

      const issue = db.find(
        (issue) => issue._id === _id && issue.project === project
      );
      if (!issue) {
        return res.json({ error: "could not update", _id: _id });
      }

      // Update the issue fields if they are provided
      if (issue_title !== undefined) issue.issue_title = issue_title;
      if (issue_text !== undefined) issue.issue_text = issue_text;
      if (created_by !== undefined) issue.created_by = created_by;
      if (assigned_to !== undefined) issue.assigned_to = assigned_to;
      if (status_text !== undefined) issue.status_text = status_text;
      if (open !== undefined) issue.open = open;

      issue.updated_on = new Date();

      res.json({ result: "successfully updated", _id: _id });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      const issueIndex = db.findIndex((obj) => obj._id.toString() === _id);
      if (!_id) {
        return res.json({ error: "missing _id" });
      } else if (issueIndex !== -1) {
        db.splice(issueIndex, 1);
        return res.json({ result: "successfully deleted", _id: _id });
      } else {
        return res.json({ error: "could not delete", _id: _id });
      }
    });
};
