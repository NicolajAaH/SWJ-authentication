const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');
const User = require('../User');
const mongoose = require('mongoose');
var Mockgoose = require('mockgoose').Mockgoose;
var mockgoose = new Mockgoose(mongoose);

chai.use(chaiHttp);
const expect = chai.expect;

before(function(done) {
  mockgoose.prepareStorage().then(function() {
      mongoose.connect('mongodb://example.com/TestingDB', function(err) {
          done(err);
      });
  });
});

after(function(done) {
  mongoose.connection.close(function() {
      done();
  });
});

describe('User authentication', () => {
  describe('/register', () => {
    it('Should register a new user', done => {
      chai
        .request(app)
        .post('/register')
        .send({
          email: 'user@email.com',
          password: 'password123',
          name: 'User',
          role: 'FRONTEND'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          expect(res.body.message).to.equal('User created');
          expect(res.body.result).to.have.property('email', 'user@email.com');
          done();
        });
    });

    it('Should not register a user with an invalid email', done => {
      chai
        .request(app)
        .post('/register')
        .send({
          email: 'invalidemail',
          password: 'password123',
          name: 'User',
          role: 'admin'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(500);
          expect(res.body.error).to.exist;
          done();
        });
    });

    it('Should not register a user with a missing field', done => {
      chai
        .request(app)
        .post('/register')
        .send({
          email: 'user@email.com',
          password: 'password123',
          role: 'admin'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(500);
          expect(res.body.error).to.exist;
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should return 200 and a JSON Web Token on successful login', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('POST /login', () => {
    it('should return 401 when the password is incorrect', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrong_password'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Auth failed');
    });
  });

  describe('POST /login', () => {
    it('should return 401 when the email is not found', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'non_existent@example.com',
          password: 'password'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Auth failed');
    });
  });

  describe('Get emails endpoint', () => {
    it('Should return a list of emails of all users', (done) => {
      request(app)
        .get('/users/emails')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.a('string');
          done();
        });
    });
  }
  );

  describe('POST /logout', () => {
    it('should return okay when calling logout', async () => {
      const res = await request(app)
        .post('/logout')
        .send();
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Logged out');
    });
  });

});
