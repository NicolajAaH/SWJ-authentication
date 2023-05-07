const chai = require('chai');
const chaiHttp = require('chai-http');
process.env.SECRET = 'c2VjcmV0X2VuY29kZWRfaW5fYmFzZTY0X3JhbmRvbV9sZXR0ZXJz' //It is a test secret
const app = require('../server.js');
const User = require('../User');
const mongoose = require('mongoose');
const sinon = require('sinon');
const bcrypt = require('bcrypt');

chai.use(chaiHttp);
const expect = chai.expect;
sinon.stub(User.prototype, 'save').resolves({});
sinon.stub(mongoose.Query.prototype, 'exec').resolves([{
  email: 'test@example.com',
  password: bcrypt.hashSync('test123', 10),
  name: 'User',
  role: 'COMPANY',
  _id: '5d9f1140f10a81216cfd4408'
}]);

describe('User authentication', () => {
  describe('/register', () => {
    it('Should register a new user', done => {
      chai
        .request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: '123456789',
          name: 'User',
          role: 'FRONTEND'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(201);
          done();
        });
    });
  });

  describe('/register', () => {
    it('Should not register a new user with no email', done => {
      chai
        .request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          name: 'User',
          role: 'FRONTEND'
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(500);
          done();
        });
    });
  });

  describe('POST /login', () => {
    it('should return 200 and a JSON Web Token on successful login', async () => {
      chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'test123'
        }).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
        });
    });
  });

  describe('POST /login', () => {
    it('should return 401 when the password is incorrect', async () => {
      chai.request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongPass'
        }).end((err, res) => {
          expect(res).to.have.status(401);
        });
    });
  });


  describe('Get emails endpoint', () => {
    it('Should return a list of emails of all users', (done) => {
      chai.request(app)
        .get('/users/emails')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          expect(res.body[0]).to.be.a('string');
          done();
        });
    });
  }
  );

  describe('Get user endpoint', () => {
    it('Should return a user', (done) => {
      chai.request(app)
        .get('/user/5d9f1140f10a81216cfd4408')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body[0].email).to.equal('test@example.com');
          expect(res.body[0]._id).to.equal('5d9f1140f10a81216cfd4408');
          expect(res.body[0].role).to.equal('COMPANY');
          expect(res.body[0].name).to.equal('User');
          done();
        });
    });
  }
  );

  describe('Put user endpoint', () => {
    it('Should put a user', (done) => {
      chai.request(app)
        .put('/user/5d9f1140f10a81216cfd4408')
        .send({
          email: 'test@example.com',
          password: '123456789',
          name: 'User',
          role: 'FRONTEND'
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('object');
          done();
        });
    });
  }
  );

  describe('Put user endpoint', () => {
    it('Should not put an empty user', (done) => {
      chai.request(app)
        .put('/user/')
        .send({
        })
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(404);
          done();
        });
    });
  }
  );

  describe('POST /logout', () => {
    it('should return okay when calling logout', async () => {
      chai.request(app)
        .post('/logout')
        .send({
          email: 'test@example.com'
        }).end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
        });
    });
  });

  describe('DELETE /user', () => {
    it('should return okay when calling delete', async () => {
      chai.request(app)
        .delete('/user/5d9f1140f10a81216cfd4408')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
        }
        );
    });

    describe('DELETE /user', () => {
      it('should return error when not calling with ID', async () => {
        chai.request(app)
          .delete('/user/')
          .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
          }
          );
      });

  });
});
});