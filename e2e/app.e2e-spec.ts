import { PurupdaterPage } from './app.po';

describe('purupdater App', function() {
  let page: PurupdaterPage;

  beforeEach(() => {
    page = new PurupdaterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
