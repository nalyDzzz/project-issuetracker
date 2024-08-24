const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
        chai.request(server).post("/api/issues/apitest").send({ 
            issue_title: "Sample Title",
            issue_text: "Sample Text",
            created_by: "Sample created by",
            assigned_to: "Sample Assigned to",
            status_text: "Sample Status Text"
        }).end((err, res) => {
            assert.equal(res.body.issue_title, "Sample Title");
            assert.isNotNull(res.body._id);
            assert.equal(res.body.issue_text, "Sample Text");
            assert.equal(res.body.created_by, "Sample created by");
            assert.isTrue(res.body.open);
            assert.isDefined(res.body.created_on);
            assert.isDefined(res.body.updated_on);
            assert.equal(res.body.assigned_to, "Sample Assigned to");
            assert.equal(res.body.status_text, "Sample Status Text");
            done();
        })
    });
    test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
        chai.request(server).post("/api/issues/apitest").send({ 
            issue_title: "Sample Title",
            issue_text: "Sample Text",
            created_by: "Sample created by"
        }).end((err, res) => {
            assert.equal(res.body.issue_title, "Sample Title");
            assert.isNotNull(res.body._id);
            assert.equal(res.body.issue_text, "Sample Text");
            assert.equal(res.body.created_by, "Sample created by");
            assert.isTrue(res.body.open);
            assert.isDefined(res.body.created_on);
            assert.isDefined(res.body.updated_on);
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            done();
        })
    });
    test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
        chai.request(server).post('/api/issues/apitest').send({
            issue_title: "Required Field 1",
            issue_text: "Required Field 2"
        }).end((err, res) => {
            assert.equal(res.body.error, "required field(s) missing")
            done();
        });
    });
    test("View issues on a project: GET request to /api/issues/{project}", (done) => {
        chai.request(server).get('/api/issues/apitest').end((err, res) => {
            assert.isArray(res.body);
            done();
        })
    });
    test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
        chai.request(server).get('/api/issues/apitest?open=true').end((err, res) => {
            assert.isArray(res.body);
            done();
        })
    });
    test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
        chai.request(server).get('/api/issues/apitest?open=true&issue_title=Sample Title').end((err, res) => {
            assert.isArray(res.body);
            done();
        })
    });
    test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
        chai.request(server).put('/api/issues/apitest').send({ _id: '1', issue_title: 'Changed sample text'}).end((err, res) => {
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, "1");
            done();
        })
    });
    test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
        chai.request(server).put('/api/issues/apitest').send({ _id: '1', issue_title: 'Changed sample text again', issue_text: "Changed Sample Text"}).end((err, res) => {
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, "1");
            done();
        });
    });
    test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
        chai.request(server).put('/api/issues/apitest').send({ issue_title: 'Changed sample text but I dont have the ID'}).end((err, res) => {
            assert.equal(res.body.error, "missing _id");
            done();
        });
    });
    test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
        chai.request(server).put('/api/issues/apitest').send({ _id: '1' }).end((err, res) => {
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, "1");
            done();
        })
    });
    test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
        chai.request(server).put('/api/issues/apitest').send({ _id: 'fakeid', issue_text: "Updated Issue Text but I have the wrong ID" }).end((err, res) => {
            assert.equal(res.body.error, "could not update");
            assert.equal(res.body._id, "fakeid");
            done();
        })
    });
    test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server).delete('/api/issues/api').send({ _id: '1' }).end((err, res) => {
            assert.equal(res.body.result, "successfully deleted");
            done();
        })
    });
    test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server).delete('/api/issues/api').send({ _id: 'fakeid' }).end((err, res) => {
            assert.equal(res.body.error, "could not delete");
            assert.equal(res.body._id, "fakeid");
            done();
        })
    });
    test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
        chai.request(server).delete('/api/issues/api').end((err, res) => {
            assert.equal(res.body.error, "missing _id");
            done();
        })
    });

});
